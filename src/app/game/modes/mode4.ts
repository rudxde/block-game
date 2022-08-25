import { IGameMode } from '.';
import type { Game } from '../game';
import { Shapes } from '../shapes';

export class Mode4GameMode implements IGameMode {
    name = 'mode4';
    spawnRetryLimit = 1;

    init(game: Game) {
        game.allShapes = [
            ...Shapes.stick4,
            ...Shapes.mediumL,
            ...Shapes.square2,
            ...Shapes.sShape,
            ...Shapes.smallT,
        ];
        game.setupShapeDimensionMap();
    }

    getRefillShapeDimensionLimit(game: Game): { maxDimension1: number, maxDimension2: number, maxDimension3: number, minDimension1: number, minDimension2: number, minDimension3: number } {
        let maxDimension = 6.5;
        let minDimension = 4;

        return {
            maxDimension1: maxDimension,
            maxDimension2: maxDimension,
            maxDimension3: maxDimension,
            minDimension1: minDimension,
            minDimension2: minDimension,
            minDimension3: minDimension,
        };
    }
}
