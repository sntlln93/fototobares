export type Metrics = {
    sales_this_month: { count: number; total: number };
    collected_this_month: number;
    outstanding_balance: number;
    production: {
        sin_empezar: number;
        en_produccion: number;
        listo_para_entregar: number;
    };
};

export type OverdueOrder = {
    id: number;
    client: string;
    child_name: string | null;
    school: string;
    due_date: string;
    balance: number;
};

export function useDashboard(metrics: Metrics) {
    const production = metrics.production;
    const productionTotal =
        production.sin_empezar +
        production.en_produccion +
        production.listo_para_entregar;

    return { production, productionTotal };
}
