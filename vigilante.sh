#!/usr/bin/env bash
#
# vigilante.sh - observabilidad del flujo autonomo de issues.
#
# Lee los transcripts que Claude Code escribe en disco mientras los agentes
# trabajan. No corre dentro del ciclo de vida de los agentes ni necesita que
# ellos reporten nada: el harness ya escribe todo incrementalmente.
#
#   ./vigilante.sh --list                     lista las sesiones disponibles
#   ./vigilante.sh --report                   reporte de la ultima sesion
#   ./vigilante.sh --report <id>              reporte de la sesion indicada
#   ./vigilante.sh --watch                    sigue en vivo la sesion activa
#   ./vigilante.sh --watch <id>               fija una sesion y sigue esa
#   ./vigilante.sh --configDir <dir>          fuerza un config dir puntual
#
# El <id> acepta un prefijo, como git: --report 2b3c alcanza si es univoco.
# (--sessionId <id> sigue andando, por si lo tenias en algun script.)
#
# Requiere jq. Los datos viven en <config-dir>/projects/<slug>/. El config dir
# se autodetecta y se imprime siempre en el encabezado: CLAUDE_CONFIG_DIR solo
# existe dentro del proceso de Claude Code, asi que un shell normal no la ve.

set -euo pipefail

# --- Precios por millon de tokens -------------------------------------------
# Editar aca cuando cambien. Multiplicadores de cache (fijos por diseno de la
# API): lectura 0.1x del precio de input, escritura 1.25x (TTL 5m) o 2x (1h).
SONNET_IN=3.00
SONNET_OUT=15.00
# Sonnet 5 tiene precio introductorio $2/$10 hasta el 2026-08-31.
if [ "$(date +%Y%m%d)" -le 20260831 ]; then
    SONNET_IN=2.00
    SONNET_OUT=10.00
fi
export SONNET_IN SONNET_OUT

# --- Ubicacion de los transcripts -------------------------------------------
PROJECT_DIR="${VIGILANTE_PROJECT:-$PWD}"
SLUG=$(printf '%s' "$PROJECT_DIR" | sed 's/[^a-zA-Z0-9]/-/g')
CONFIG_DIR=""
BASE=""
CANDIDATES=0

die() {
    printf 'vigilante: %s\n' "$1" >&2
    exit 1
}

command -v jq >/dev/null 2>&1 || die "hace falta jq"

mtime_of() {
    stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0
}

# Actividad mas reciente de un proyecto dentro de un config dir.
latest_activity() {
    local f m newest=0
    for f in "$1"/*.jsonl; do
        [ -f "$f" ] || continue
        m=$(mtime_of "$f")
        [ "$m" -gt "$newest" ] && newest="$m"
    done
    printf '%s' "$newest"
}

# No confiar en $CLAUDE_CONFIG_DIR a secas: la setea un alias dentro del proceso
# de Claude Code, asi que corriendo desde una terminal normal no existe y el
# viejo fallback a ~/.claude leia datos rancios sin avisar. Se juntan los
# candidatos, se descartan los que no tengan este proyecto, y gana el de
# actividad mas reciente. El elegido se imprime siempre.
resolve_base() {
    local c m best="" bestm=0 seen=""
    if [ -n "$CONFIG_OVERRIDE" ]; then
        [ -d "$CONFIG_OVERRIDE/projects/$SLUG" ] ||
            die "no hay datos de $PROJECT_DIR en $CONFIG_OVERRIDE"
        CONFIG_DIR="$CONFIG_OVERRIDE"
        BASE="$CONFIG_DIR/projects/$SLUG"
        CANDIDATES=1
        return
    fi
    for c in ${CLAUDE_CONFIG_DIR:+"$CLAUDE_CONFIG_DIR"} "$HOME"/.claude*; do
        [ -d "$c/projects/$SLUG" ] || continue
        case " $seen " in *" $c "*) continue ;; esac
        seen="$seen $c"
        CANDIDATES=$((CANDIDATES + 1))
        m=$(latest_activity "$c/projects/$SLUG")
        if [ "$m" -gt "$bestm" ]; then
            bestm="$m"
            best="$c"
        fi
    done
    [ -n "$best" ] ||
        die "no encontre transcripts de $PROJECT_DIR (busque en \$CLAUDE_CONFIG_DIR y \$HOME/.claude*)"
    CONFIG_DIR="$best"
    BASE="$CONFIG_DIR/projects/$SLUG"
}

banner() {
    printf '  Proyecto: %s\n' "$PROJECT_DIR"
    if [ "$CANDIDATES" -gt 1 ]; then
        printf '  Config:   %s  (%s candidatos, gana el mas reciente)\n' \
            "$CONFIG_DIR" "$CANDIDATES"
    else
        printf '  Config:   %s\n' "$CONFIG_DIR"
    fi
}

# Sesiones que tienen subagentes, de la mas reciente a la mas vieja.
sessions_with_agents() {
    local d sess
    for d in "$BASE"/*/subagents; do
        [ -d "$d" ] || continue
        ls "$d"/*.meta.json >/dev/null 2>&1 || continue
        sess=$(basename "$(dirname "$d")")
        printf '%s\t%s\n' "$(mtime_of "$d")" "$sess"
    done | sort -rn | cut -f2
}

latest_session() {
    sessions_with_agents | head -1
}

# La sesion viva se detecta por el transcript RAIZ, no por el dir subagents:
# el raiz se escribe desde el primer mensaje, mientras que subagents/ no existe
# hasta el primer spawn y deja de moverse apenas termina el ultimo agente (se
# midieron desfases de mas de una hora). Elegir por subagents/ hacia que una
# corrida recien arrancada mostrara la corrida ANTERIOR como si fuera la actual.
latest_active_session() {
    local f
    for f in "$BASE"/*.jsonl; do
        [ -f "$f" ] || continue
        printf '%s\t%s\n' "$(mtime_of "$f")" "$(basename "$f" .jsonl)"
    done | sort -rn | head -1 | cut -f2
}

session_has_agents() {
    ls "$BASE/$1/subagents"/*.meta.json >/dev/null 2>&1
}

# Resuelve un id completo o un prefijo univoco (estilo git) contra las sesiones
# que tienen agentes. Imprime el id resuelto.
resolve_session() {
    local want="$1" s hits="" n=0
    for s in $(sessions_with_agents); do
        case "$s" in
        "$want")
            printf '%s' "$s"
            return
            ;;
        "$want"*)
            hits="$hits $s"
            n=$((n + 1))
            ;;
        esac
    done
    case "$n" in
    0) die "sesion desconocida: $want (probá --list)" ;;
    1) printf '%s' "${hits# }" ;;
    *) die "prefijo ambiguo: $want coincide con$hits" ;;
    esac
}

# --- Extraccion por agente ---------------------------------------------------
# Emite una fila TSV:
#   rol depth agentId toolUseId modelo inicio elapsed in out cread cwrite
#   nTools ultimaTool costo nTurnos
# Turnos != tool calls: un turno es un mensaje del modelo (puede no usar tools,
# o usar varias). El turno es la unidad de costo, porque cada uno re-lee todo
# el contexto acumulado.
JQ_AGENT='
def price(m):
  if m == null then {i:5,o:25}
  elif (m|test("fable|mythos")) then {i:10,o:50}
  elif (m|test("opus"))   then {i:5,o:25}
  elif (m|test("sonnet")) then {i:($ENV.SONNET_IN|tonumber), o:($ENV.SONNET_OUT|tonumber)}
  elif (m|test("haiku"))  then {i:1,o:5}
  else {i:5,o:25} end;

def secs: sub("\\.[0-9]+Z$";"Z") | fromdateiso8601;

. as $lines
| $meta[0] as $m
| [ $lines[] | select(.type=="assistant") ] as $as
| [ $as[] | .message.usage // {} ] as $u
| [ $lines[] | .timestamp // empty ] as $ts
| ([ $as[] | .message.model // empty ] | last) as $model
| ($u | map(.input_tokens // 0)              | add // 0) as $in
| ($u | map(.output_tokens // 0)             | add // 0) as $out
| ($u | map(.cache_read_input_tokens // 0)   | add // 0) as $cr
# Si falta el desglose por TTL, se imputa todo a 5m (el multiplicador menor).
| ($u | map(if .cache_creation then (.cache_creation.ephemeral_5m_input_tokens // 0)
            else (.cache_creation_input_tokens // 0) end) | add // 0) as $cw5
| ($u | map(.cache_creation.ephemeral_1h_input_tokens // 0) | add // 0) as $cw1
| [ $as[] | .message.content[]? | select(.type=="tool_use") ] as $tools
| ($tools | last) as $lt
# Contexto = todo lo que entra en el request de un turno. Crece sin volver a
# bajar, y se paga entero en CADA turno posterior: es el driver del costo.
| def ctxof(x): (x.input_tokens//0) + (x.cache_read_input_tokens//0)
              + (x.cache_creation_input_tokens//0);
  (if ($u|length) > 0 then ctxof($u[0]) else 0 end) as $ctx0
| (if ($u|length) > 0 then ctxof($u[-1]) else 0 end) as $ctxN
# Cuanto del contexto es texto propio del agente vs lo que devolvieron las
# tools. Un share alto = el agente se ahoga con su propia verborragia.
| ([ $lines[] | select(.type=="user") | .message.content[]?
     | select(type=="object" and .type=="tool_result")
     | (.content | tojson | length) ] | add // 0) as $trchars
| (($trchars/4) | floor) as $trtok
| (if ($out + $trtok) > 0 then (($out*100/($out+$trtok)) | round) else 0 end) as $ownpct
| (price($model)) as $p
| ( ($in/1000000*$p.i) + ($out/1000000*$p.o) + ($cr/1000000*$p.i*0.1)
  + ($cw5/1000000*$p.i*1.25) + ($cw1/1000000*$p.i*2.0) ) as $cost
| ( if ($ts|length) > 0 then (($ts|last|secs) - ($ts|first|secs)) else 0 end ) as $elapsed
| [ ($m.agentType // "?"),
    ($m.spawnDepth // 1),
    $ENV.AGENT_ID,
    ($m.toolUseId // "-"),
    (($model // "-") | sub("^claude-";"")),
    (if ($ts|length) > 0 then ($ts|first) else "-" end),
    ($elapsed | floor),
    $in, $out, $cr, ($cw5+$cw1),
    ($tools | length),
    ( if $lt then
        ($lt.name + "(" + ((($lt.input.file_path // $lt.input.pattern
          // $lt.input.command // $lt.input.description // "")
          | tostring | gsub("\\s+";" "))[0:70]) + ")")
      else "-" end ),
    ($cost*10000 | round / 10000),
    ($as | length),
    $ctx0, $ctxN, $ownpct, $trtok
  ] | @tsv
'

agent_rows() {
    local sess="$1" dir jsonl meta aid
    dir="$BASE/$sess/subagents"
    for jsonl in "$dir"/agent-*.jsonl; do
        [ -f "$jsonl" ] || continue
        aid=$(basename "$jsonl" .jsonl)
        aid=${aid#agent-}
        meta="$dir/agent-$aid.meta.json"
        [ -f "$meta" ] || continue
        AGENT_ID="$aid" jq -s -r --slurpfile meta "$meta" "$JQ_AGENT" "$jsonl"
    done
}

# Mapa toolUseId -> quien lo lanzo. La raiz es la sesion; los depth=2 los
# lanza el agente cuyo transcript contiene ese tool_use.
owner_map() {
    local sess="$1" f aid
    if [ -f "$BASE/$sess.jsonl" ]; then
        jq -r '
            select(.type=="assistant")
            | .message.content[]? | select(.type=="tool_use" and .name=="Agent")
            | .id + "\tROOT"
        ' "$BASE/$sess.jsonl" 2>/dev/null || true
    fi
    for f in "$BASE/$sess/subagents"/agent-*.jsonl; do
        [ -f "$f" ] || continue
        aid=$(basename "$f" .jsonl)
        aid=${aid#agent-}
        jq -r --arg aid "$aid" '
            select(.type=="assistant")
            | .message.content[]? | select(.type=="tool_use" and .name=="Agent")
            | .id + "\t" + $aid
        ' "$f" 2>/dev/null || true
    done
}

SEP="-------------------------------------------------------------------------------------------------------"

# Ancho util de la terminal. Las columnas fijas de --watch ocupan 61; lo que
# sobra es para la ultima accion, que se recorta para no envolver la linea.
term_cols() {
    local c="${COLUMNS:-}"
    # tput ignora $COLUMNS y fuera de una TTY devuelve 80 o falla, asi que
    # $COLUMNS manda cuando existe: lo setea todo shell interactivo.
    [ -n "$c" ] || c=$(tput cols 2>/dev/null || echo 100)
    [ "$c" -ge 60 ] 2>/dev/null || c=100
    printf '%s' "$c"
}

dashes() {
    local n="$1" s=""
    while [ ${#s} -lt "$n" ]; do s="$s----------"; done
    printf '%s' "${s:0:$n}"
}

fmt_dur() {
    local s=${1:-0}
    if [ "$s" -ge 3600 ]; then
        printf '%dh%02dm' $((s / 3600)) $(((s % 3600) / 60))
    elif [ "$s" -ge 60 ]; then
        printf '%dm%02ds' $((s / 60)) $((s % 60))
    else
        printf '%ds' "$s"
    fi
}

fmt_tok() {
    awk -v n="${1:-0}" 'BEGIN{
        if (n >= 1000000) printf "%.1fM", n/1000000;
        else if (n >= 1000) printf "%.1fk", n/1000;
        else printf "%d", n;
    }'
}

# --- Modo --list -------------------------------------------------------------
cmd_list() {
    local sess rows n roles start
    printf '\n  Sesiones con agentes\n'
    banner
    printf '\n'
    printf '  %-38s %-17s %7s  %s\n' "SESION" "INICIO" "AGENTES" "ROLES"
    printf '  %-38s %-17s %7s  %s\n' "--------------------------------------" \
        "-----------------" "-------" "-----------------------------------"
    for sess in $(sessions_with_agents); do
        rows=$(agent_rows "$sess")
        [ -n "$rows" ] || continue
        n=$(printf '%s\n' "$rows" | wc -l | tr -d ' ')
        roles=$(printf '%s\n' "$rows" | cut -f1 | sort | uniq -c |
            awk '{ if ($1 > 1) printf "%s x%s, ", $2, $1; else printf "%s, ", $2 }' |
            sed 's/, $//')
        start=$(printf '%s\n' "$rows" | cut -f6 | grep -v '^-$' | sort | head -1)
        start=$(printf '%s' "$start" | cut -c1-16 | tr 'T' ' ')
        printf '  %-38s %-17s %7s  %s\n' "$sess" "${start:--}" "$n" "$roles"
    done
    printf '\n'
}

# --- Modo --report -----------------------------------------------------------
cmd_report() {
    local sess="$1" rows omap tmp
    rows=$(agent_rows "$sess")
    [ -n "$rows" ] || die "la sesion $sess no tiene agentes"
    omap=$(owner_map "$sess")

    tmp=$(mktemp)
    printf '%s\n' "$rows" >"$tmp"

    printf '\n  Reporte de sesion %s\n' "$sess"
    banner
    printf '\n'
    printf '  %-24s %-12s %6s %8s %8s %8s %12s %7s %9s\n' \
        "ROL" "MODELO" "TURNOS" "TIEMPO" "OUT" "CACHE" "CONTEXTO" "PROPIO" "COSTO"
    printf '  %s\n' "$SEP"

    # depth=1 primero, y debajo sus hijos.
    local role depth aid tuid model start el in out cr cw nt lt cost turns
    local ctx0 ctxN ownpct trtok
    local prow pdepth paid
    while IFS=$'\t' read -r role depth aid tuid model start el in out cr cw nt lt cost turns ctx0 ctxN ownpct trtok; do
        [ "$depth" = "1" ] || continue
        printf '  %-24s %-12s %6s %8s %8s %8s %12s %7s %9s\n' \
            "${role:0:24}" "${model:0:12}" "$turns" "$(fmt_dur "$el")" \
            "$(fmt_tok "$out")" "$(fmt_tok $((cr + cw)))" \
            "$(fmt_tok "$ctx0")->$(fmt_tok "$ctxN")" "$ownpct%" \
            "$(printf '$%.4f' "$cost")"
        # hijos lanzados por este agente
        while IFS=$'\t' read -r prow pdepth paid tuid model start el in out cr cw nt lt cost turns ctx0 ctxN ownpct trtok; do
            [ "$pdepth" = "2" ] || continue
            case "$(printf '%s\n' "$omap" | grep "^$tuid	" | cut -f2)" in
            "$aid") ;;
            *) continue ;;
            esac
            printf '    \-> %-18s %-12s %6s %8s %8s %8s %12s %7s %9s\n' \
                "${prow:0:18}" "${model:0:12}" "$turns" "$(fmt_dur "$el")" \
                "$(fmt_tok "$out")" "$(fmt_tok $((cr + cw)))" \
                "$(fmt_tok "$ctx0")->$(fmt_tok "$ctxN")" "$ownpct%" \
                "$(printf '$%.4f' "$cost")"
        done <"$tmp"
    done <"$tmp"

    printf '  %s\n' "$SEP"
    awk -F'\t' '
        { out+=$9; cr+=$10; cw+=$11; cost+=$14; turns+=$15; trtok+=$19; n++ }
        END {
            printf "  %-24s %-12s %6s %8s %8s %8s %12s %7s %9s\n", "TOTAL (" n " agentes)", "", \
                   turns, "", \
                   (out>=1000?sprintf("%.1fk",out/1000):out), \
                   ((cr+cw)>=1000000?sprintf("%.1fM",(cr+cw)/1000000):sprintf("%.1fk",(cr+cw)/1000)), \
                   "", \
                   sprintf("%d%%", (out+trtok)>0 ? (100*out/(out+trtok)) : 0), \
                   sprintf("$%.4f", cost)
        }' "$tmp"
    printf '\n  CONTEXTO: tokens del request al primer turno -> al ultimo. Se paga entero\n'
    printf '  en cada turno, asi que su crecimiento es el driver del costo.\n'
    printf '  PROPIO: %% del contexto que es texto del propio agente (vs. lo que\n'
    printf '  devolvieron las tools). Alto = el agente se ahoga con lo que escribe.\n'
    printf '  Cache: lectura 0.1x input, escritura 1.25x (5m) o 2x (1h).\n\n'
    rm -f "$tmp"
}

# --- Modo --watch ------------------------------------------------------------
cmd_watch() {
    local pinned="${1:-}"
    local sess role depth aid tuid model start el in out cr cw nt lt cost
    local now mt state dir age cols ltw
    trap 'printf "\n"; exit 0' INT
    while :; do
        if [ -n "$pinned" ]; then sess="$pinned"; else sess=$(latest_active_session); fi
        now=$(date +%s)
        printf '\033[H\033[2J'
        if [ -z "${sess:-}" ]; then
            printf '  vigilante --watch\n'
            banner
            printf '\n  Todavia no hay ninguna sesion en este proyecto.\n'
            sleep 3
            continue
        fi
        age=$((now - $(mtime_of "$BASE/$sess.jsonl")))
        printf '  vigilante --watch   sesion %s%s\n' "$sess" \
            "$([ -n "$pinned" ] && printf ' (fijada)')"
        banner
        printf '  %s   ultima actividad hace %s   (ctrl-c para salir)\n\n' \
            "$(date '+%H:%M:%S')" "$(fmt_dur "$age")"
        if ! session_has_agents "$sess"; then
            printf '  La sesion esta viva pero todavia no spawneo agentes.\n'
            printf '  (No muestro la corrida anterior: seria un dato viejo disfrazado de actual.)\n'
            sleep 2
            continue
        fi
        dir="$BASE/$sess/subagents"
        cols=$(term_cols)
        # Las columnas fijas ocupan 68; -69 deja un margen para no envolver.
        ltw=$((cols - 69))
        [ "$ltw" -ge 12 ] || ltw=12
        printf '  %-8s %-20s %-12s %7s %6s %6s  %s\n' \
            "ESTADO" "ROL" "MODELO" "TIEMPO" "TURNOS" "TOOLS" "ULTIMA ACCION"
        printf '  %s\n' "$(dashes $((cols - 2)))"
        while IFS=$'\t' read -r role depth aid tuid model start el in out cr cw nt lt cost turns; do
            mt=$(mtime_of "$dir/agent-$aid.jsonl")
            if [ $((now - mt)) -lt 20 ]; then state="ACTIVO"; else state="-"; fi
            if [ "$depth" = "2" ]; then role="  \-> $role"; fi
            printf '  %-8s %-20s %-12s %7s %6s %6s  %s\n' \
                "$state" "${role:0:20}" "${model:0:12}" "$(fmt_dur "$el")" \
                "$turns" "$nt" "${lt:0:$ltw}"
        done < <(agent_rows "$sess" | sort -t"$(printf '\t')" -k2,2n)
        printf '\n'
        sleep 2
    done
}

# --- CLI ---------------------------------------------------------------------
MODE=""
SESSION=""
CONFIG_OVERRIDE=""
while [ $# -gt 0 ]; do
    case "$1" in
    --list) MODE=list ;;
    --report) MODE=report ;;
    --watch) MODE=watch ;;
    --sessionId)
        shift
        SESSION="${1:-}"
        [ -n "$SESSION" ] || die "--sessionId necesita un valor"
        ;;
    --sessionId=*) SESSION="${1#--sessionId=}" ;;
    --configDir)
        shift
        CONFIG_OVERRIDE="${1:-}"
        [ -n "$CONFIG_OVERRIDE" ] || die "--configDir necesita un valor"
        ;;
    --configDir=*) CONFIG_OVERRIDE="${1#--configDir=}" ;;
    -h | --help)
        awk 'NR<3 {next} /^#/ {sub(/^# ?/,""); print; next} {exit}' "$0"
        exit 0
        ;;
    -*) die "opcion desconocida: $1 (probá --help)" ;;
    *)
        [ -z "$SESSION" ] || die "sesion indicada dos veces: $SESSION y $1"
        SESSION="$1"
        ;;
    esac
    shift
done

[ -n "$MODE" ] || die "falta un modo: --list, --report o --watch (probá --help)"
resolve_base

case "$MODE" in
list) cmd_list ;;
watch)
    if [ -n "$SESSION" ]; then
        SESSION=$(resolve_session "$SESSION")
    fi
    cmd_watch "$SESSION"
    ;;
report)
    if [ -z "$SESSION" ]; then
        SESSION=$(latest_session) || true
        [ -n "$SESSION" ] || die "no hay ninguna sesion con agentes"
    else
        SESSION=$(resolve_session "$SESSION")
    fi
    cmd_report "$SESSION"
    ;;
*) die "falta un modo: --list, --report o --watch (probá --help)" ;;
esac
