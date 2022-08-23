import { IGameMode } from '.';
import type { Game } from '../game';
import { Shapes } from '../shapes';

export class Mode4GameMode implements IGameMode {
    name = 'mode4';

    init(game: Game) {
        game.allShapes = [
            ...Shapes.stick4,
            ...Shapes.mediumL,
            ...Shapes.square2,
            ...Shapes.sShape,
            ...Shapes.smallT,
        ];
        game.setupShapeDimensionMap();
        console.log(game.shapesByMaxDimension);
    }

    getRefillShapeDimensionLimit(game: Game): { maxDimension1: number, maxDimension2: number, maxDimension3: number, minDimension1: number, minDimension2: number, minDimension3: number } {
        // The following dimensions exist 2,3.5,4,5,5.5,6,6.5,8
        let maxDimension1 = 6.5;
        let maxDimension2 = 6.5;
        let maxDimension3 = 6.5;
        let minDimension1 = 4;
        let minDimension2 = 4;
        let minDimension3 = 4;

        return { maxDimension1, maxDimension2, maxDimension3, minDimension1, minDimension2, minDimension3 };
    }
}
