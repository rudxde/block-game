import { IGameMode } from '.';
import type { Game } from '../game';
import { Shapes } from '../shapes';

export class ExtremeGameMode implements IGameMode {
    name = 'extreme';

    init(game: Game) {
        game.allShapes.push(
            ...Shapes.stair,
            ...Shapes.lEdge,
            ...Shapes.rectangle,
            ...Shapes.bigCShape,
            ...Shapes.square3,
            ...Shapes.square4,
            ...Shapes.square5,
        );
        game.setupShapeDimensionMap();
    }

    getRefillShapeDimensionLimit(game: Game): { maxDimension1: number, maxDimension2: number, maxDimension3: number, minDimension1: number, minDimension2: number, minDimension3: number } {
        // The following dimensions exist 2,3.5,4,5,5.5,6,6.5,8
        let maxDimension1 = 8;
        let maxDimension2 = 8;
        let maxDimension3 = 8;
        let minDimension1 = 5;
        let minDimension2 = 5;
        let minDimension3 = 5;

        if (game.score === 0) {
            maxDimension3 = 10;
        }

        if (game.score < 100) {
            minDimension1 = 4;
            minDimension2 = 4;
        } else if (game.score < 500) {
            minDimension1 = 4;
        }
        return { maxDimension1, maxDimension2, maxDimension3, minDimension1, minDimension2, minDimension3 };
    }
}
