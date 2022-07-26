import { IGameMode } from '.';
import type { Game } from '../game';

export class BabyGameMode implements IGameMode {
    name = 'baby';
    
    getRefillShapeDimensionLimit(game: Game): { maxDimension1: number, maxDimension2: number, maxDimension3: number } {
        let maxDimension1 = 4;
        let maxDimension2 = 4;
        let maxDimension3 = 4;
        return { maxDimension1, maxDimension2, maxDimension3 };
    }
}
