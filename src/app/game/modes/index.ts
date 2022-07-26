import type { Game } from '../game';

export interface IGameMode {
    name: string;
    getRefillShapeDimensionLimit(game: Game): { maxDimension1: number, maxDimension2: number, maxDimension3: number };
}
