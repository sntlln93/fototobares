import { describe, expect, it } from 'vitest';
import { getStageRollback } from './production-stage';

const statuses: ProductionStatus[] = [
    { id: 21, name: 'Impreso', position: 1 },
    { id: 22, name: 'Pegado', position: 2 },
    { id: 23, name: 'Terminado', position: 3 },
];

describe('getStageRollback', () => {
    it('is not a rollback when moving forward', () => {
        expect(getStageRollback(statuses, 21, 22)).toMatchObject({
            isRollback: false,
        });
    });

    it('flags a backward move of one stage', () => {
        expect(getStageRollback(statuses, 22, 21)).toEqual({
            isRollback: true,
            stepsBack: 1,
            targetName: 'Impreso',
        });
    });

    it('flags a backward move across multiple stages', () => {
        expect(getStageRollback(statuses, 23, 21)).toEqual({
            isRollback: true,
            stepsBack: 2,
            targetName: 'Impreso',
        });
    });

    it('is not a rollback when the stage does not change', () => {
        expect(getStageRollback(statuses, 22, 22)).toMatchObject({
            isRollback: false,
            stepsBack: 0,
        });
    });

    it('treats moving to "Sin empezar" as a one-stage rollback', () => {
        expect(getStageRollback(statuses, 21, null)).toEqual({
            isRollback: true,
            stepsBack: 1,
            targetName: 'Sin empezar',
        });
    });

    it('is not a rollback when starting from "Sin empezar"', () => {
        expect(getStageRollback(statuses, null, 21)).toMatchObject({
            isRollback: false,
        });
    });
});
