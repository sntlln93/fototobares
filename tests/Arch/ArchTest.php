<?php

declare(strict_types=1);

use App\Contracts\ActionContract;
use App\Http\Controllers\Controller;
use App\Models\ComboProduct;
use App\Models\OrderDetail;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Resources\Json\JsonResource;

/*
 |-----------------------------------------------------------------------------
 | Architecture tests (#81)
 |-----------------------------------------------------------------------------
 |
 | These encode the code-quality rules from CLAUDE.md so they are enforced
 | automatically. Rules are enforced STRICTLY, with no baseline: the whole
 | codebase complies. A failing arch test therefore points at exactly what
 | regressed (DB logic that belongs in an Action/Service, inline validation that
 | belongs in a FormRequest, ...). Fix it by refactoring, never by adding an
 | exception.
 |
 | The only ->ignoring() entries are correctness exceptions, NOT debt:
 |   - the abstract base Controller cannot extend itself;
 |   - User / pivot models correctly extend Authenticatable / Pivot, which ARE
 |     Eloquent models — flagging them would be a false positive with no fix.
 */

// --- Whole-app hygiene ------------------------------------------------------

arch('code declares strict types')
    ->expect('App')
    ->toUseStrictTypes();

arch('no debugging or dangerous php constructs')
    ->preset()
    ->php();

arch('no insecure primitives')
    ->preset()
    ->security();

// --- Controllers: thin, conventional ----------------------------------------

arch('controllers are suffixed')
    ->expect('App\Http\Controllers')
    ->toHaveSuffix('Controller');

arch('controllers extend the base controller')
    ->expect('App\Http\Controllers')
    ->toExtend(Controller::class)
    ->ignoring([Controller::class]); // the base cannot extend itself

// Thin controllers own no persistence: the DB facade (transactions, raw
// queries) belongs in Actions/Services.
arch('controllers do not touch the database facade')
    ->expect('App\Http\Controllers')
    ->not->toUse('Illuminate\Support\Facades\DB');

// --- FormRequests -----------------------------------------------------------

arch('form requests are conventional')
    ->expect('App\Http\Requests')
    ->toExtend(FormRequest::class)
    ->toHaveSuffix('Request');

// --- API Resources ----------------------------------------------------------

arch('resources are conventional')
    ->expect('App\Http\Resources')
    ->toExtend(JsonResource::class)
    ->toHaveSuffix('Resource');

// --- Models: thin, framework-rooted -----------------------------------------

arch('models extend eloquent')
    ->expect('App\Models')
    ->toExtend(Model::class)
    ->ignoring([
        // Correctness exceptions, NOT debt: valid Eloquent base classes.
        User::class,         // Authenticatable
        ComboProduct::class, // Pivot
        OrderDetail::class,  // Pivot
    ]);

// --- Actions: single-responsibility -----------------------------------------

arch('actions implement the action contract')
    ->expect('App\Actions')
    ->toImplement(ActionContract::class);

arch('actions handle through the canonical entrypoint')
    ->expect('App\Actions')
    ->toHaveMethod('handle');

// The contract is a marker (see App\Contracts\ActionContract), so the
// "one thing, one entrypoint" rule is enforced here: every Action exposes
// exactly one public method (the constructor aside), which — paired with the
// rule above — must be handle().
test('actions expose a single public method', function () {
    $actionsDir = dirname(__DIR__, 2).'/app/Actions';
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($actionsDir, FilesystemIterator::SKIP_DOTS)
    );

    $offenders = [];
    foreach ($iterator as $file) {
        if ($file->getExtension() !== 'php') {
            continue;
        }

        $relative = str_replace([$actionsDir.'/', '.php'], '', $file->getPathname());
        $class = 'App\\Actions\\'.str_replace('/', '\\', $relative);

        $reflection = new ReflectionClass($class);
        if ($reflection->isInterface() || $reflection->isAbstract()) {
            continue;
        }

        $publicMethods = array_values(array_filter(
            array_map(
                fn (ReflectionMethod $m) => $m->getName(),
                $reflection->getMethods(ReflectionMethod::IS_PUBLIC)
            ),
            fn (string $name) => $name !== '__construct'
        ));

        if (count($publicMethods) !== 1) {
            $offenders[$class] = $publicMethods;
        }
    }

    expect($offenders)->toBe([], 'Actions must expose exactly one public method: '.json_encode($offenders));
});

// --- Enums ------------------------------------------------------------------

arch('enums are enums')
    ->expect('App\Enums')
    ->toBeEnums();

// --- Layering: dependencies point inward ------------------------------------

arch('the domain layer does not depend on the http layer')
    ->expect(['App\Actions', 'App\Services', 'App\Models'])
    ->not->toUse('App\Http');

// --- Rules Pest\Arch cannot express as expectations -------------------------

// "Never $request->validate() in a controller — always inject a FormRequest."
// Arch expectations can only see imports/types, not method calls on $request,
// so this is a content scan. No baseline: every offender fails, so the message
// is the exact list of controllers to move onto FormRequests.
test('controllers do not validate inline', function () {
    $controllersDir = dirname(__DIR__, 2).'/app/Http/Controllers';
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($controllersDir, FilesystemIterator::SKIP_DOTS)
    );

    $offenders = [];
    foreach ($iterator as $file) {
        if ($file->getExtension() !== 'php') {
            continue;
        }

        $contents = (string) file_get_contents($file->getPathname());
        if (str_contains($contents, '->validate(')) {
            $offenders[] = $file->getBasename();
        }
    }

    sort($offenders);
    expect($offenders)->toBe([], 'These controllers validate inline; inject a FormRequest instead: '.implode(', ', $offenders));
});
