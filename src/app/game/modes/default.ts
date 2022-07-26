import { IGameMode } from '.';
import type { Game } from '../game';

export class DefaultGameMode implements IGameMode {
    name = 'default';
    
    getRefillShapeDimensionLimit(game: Game): { maxDimension1: number, maxDimension2: number, maxDimension3: number } {
        let maxDimension1 = 8;
        let maxDimension2 = 8;
        let maxDimension3 = 8; // one field can always have all shapes

        if (game.score < 200) {
            maxDimension1 = 3.5;
            maxDimension2 = 5.5;
        } else if (game.score < 500) {
            maxDimension1 = 5;
            maxDimension2 = 8;
        } else if (game.score < 1000) {
            maxDimension1 = 5.5;
            maxDimension2 = 8;
        }
        return { maxDimension1, maxDimension2, maxDimension3 };
    }
}
