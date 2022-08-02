import { BehaviorSubject } from 'rxjs';
import { shuffle } from '../utils/shuffle-array';
import { IGameMode } from './modes';
import { getShapes, IShape } from './shapes';

export interface IField {
    x: number;
    y: number;
    placed: boolean;
    highlighted: boolean;
    marked: boolean;
    animationProgress?: number;
    removed: boolean;
}

export interface IStoredGame {
    score: number;
    gameField: IField[][];
    nextShapes: IDraggingShape[];
    gameEnded: boolean;
    streakMultiplier: number;
}


interface IDraggingShape {
    shape?: IShape;
    isDragging: boolean;
    pickAnimation?: number;
    index: number;
}

export class Game {

    allShapes: IShape[] = getShapes();
    shapesByMaxDimension: Map<number, IShape[]> = new Map();
    debugMode = false;

    isHighScore = false;
    gameEnded$ = new BehaviorSubject<boolean>(false);

    highScore = 0;
    lastHighScore = 0;

    constructor(
        private gameMode: IGameMode,
        public gameField: IField[][],
        public nextShapes: IDraggingShape[] = [],
        public score = 0,
        public streakMultiplier = 1,
    ) {
        this.setupShapeDimensionMap();
        this.loadHighScore();
        this.nextShapes.forEach(x => {
            x.isDragging = false;
            x.pickAnimation = undefined;
        });
        if(this.gameMode.init) {
            this.gameMode.init(this);
        }
        if(this.nextShapes.length === 0) {
            this.refillShapes();
        }
    }

    setupShapeDimensionMap() {
        this.shapesByMaxDimension.clear();
        for (let shape of this.allShapes) {
            const dim = this.getShapeDimension(shape);
            if (!this.shapesByMaxDimension.has(dim)) {
                this.shapesByMaxDimension.set(dim, []);
            }
        }
        const availableDimensions = Array.from(this.shapesByMaxDimension.keys());
        for (let shape of this.allShapes) {
            const dim = this.getShapeDimension(shape);
            for (let k of availableDimensions) {
                if (k >= dim) {
                    // continue;
                    this.shapesByMaxDimension.get(k)!.push(shape);
                }
            }
        }
    }

    storeGame() {
        let game: IStoredGame = {
            gameField: this.gameField,
            nextShapes: this.nextShapes,
            score: this.score,
            gameEnded: this.gameEnded$.value,
            streakMultiplier: this.streakMultiplier,
        };
        localStorage.setItem(this.gameMode.name + '_store', JSON.stringify(game));
    }

    tick() {
        let shouldStore = false;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (!this.gameField[i][j].removed) {
                    continue;
                }
                if ((this.gameField[i][j].animationProgress ?? 0) >= 100) {
                    this.gameField[i][j].removed = false;
                    this.gameField[i][j].animationProgress = undefined;
                    shouldStore = true;
                    continue;
                }
                this.gameField[i][j].animationProgress = (this.gameField[i][j].animationProgress ?? 0) + 10;
            }
        }
        const draggingShape = this.getDraggingShape();
        if (draggingShape && draggingShape.pickAnimation) {
            draggingShape.pickAnimation += 5;
            if (draggingShape.pickAnimation >= 100) {
                draggingShape.pickAnimation = undefined;
            }
        }
        if (shouldStore) {
            this.storeGame();
        }
    }

    private loadHighScore() {
        this.isHighScore = false;
        this.highScore = parseInt(localStorage.getItem(this.gameMode.name + '_highScore') ?? '0');
        this.lastHighScore = this.highScore;
    }

    refillShapes() {
        // The following dimensions exist 2,3.5,4,5,5.5,6,6.5,8

        let dimensionLimits = this.gameMode.getRefillShapeDimensionLimit(this);

        this.nextShapes = [
            { shape: this.getRandomShape(dimensionLimits.maxDimension1, dimensionLimits.minDimension1), isDragging: false, index: 0 },
            { shape: this.getRandomShape(dimensionLimits.maxDimension2, dimensionLimits.minDimension2), isDragging: false, index: 0 },
            { shape: this.getRandomShape(dimensionLimits.maxDimension3, dimensionLimits.minDimension3), isDragging: false, index: 0 },
        ];
        shuffle(this.nextShapes);
        this.nextShapes.forEach((x, i) => x.index = i);
    }

    endGame() {
        this.isHighScore = this.score > this.lastHighScore;
        if (this.isHighScore) {
            localStorage.setItem(this.gameMode.name + '_highScore', this.score.toString(10));
        }
        this.gameEnded$.next(true);
    }

    resetMarkings() {
        this.gameField.forEach(line => line.forEach(field => {
            field.highlighted = false;
            field.marked = false;
        }));
    }

    placeDragging(draggingShape: IDraggingShape, position: { x: number, y: number }): void {
        let placed = 0;
        this.resetMarkings();
        if (!draggingShape.shape) {
            throw new Error('dragging shape has no shape');
        }
        if (!this.positionIsOnBoard(position)) {
            return;
        }
        if (!this.canDropShape(draggingShape.shape, position)) {
            return;
        }

        placed = this.placeShape(draggingShape.shape, position);
        draggingShape.isDragging = true;
        draggingShape.shape = undefined;
        this.performChecksAfterPlaced(placed);
    }

    markDraggingShape(draggingShape: IDraggingShape, position: { x: number, y: number }) {
        this.resetMarkings();
        if (!draggingShape.shape) {
            throw new Error('dragging shape has no shape');
        }
        // const position = this.getDraggingCellPosition(dragging.shape, dragPosition);
        if (!this.positionIsOnBoard(position)) {
            return;
        }
        if (!this.canDropShape(draggingShape.shape, position)) {
            return;
        }

        this.markShape(draggingShape.shape, position);
        this.checkEliminationMarking();
    }

    setDraggingShape(index: number): void {
        if (!this.nextShapes[index]?.shape) {
            // no shape in this slot
            return;
        }
        if (!this.shapeCanBePlaced(this.nextShapes[index].shape!)) {
            return;
        }
        this.nextShapes[index].isDragging = true;
        this.nextShapes[index].pickAnimation = 1;
    }

    releaseDraggingShape() {
        let draggingShape = this.getDraggingShape();
        if (!draggingShape) {
            return;
        }
        draggingShape.isDragging = false;
    }

    getDraggingShape(): IDraggingShape | undefined {
        let dragging = this.nextShapes.find(x => x.isDragging);
        if (!dragging) {
            return;
        }
        if (!dragging.shape) {
            throw new Error('dragging shape has no shape');
        }
        return dragging;
    }

    shapeCanBePlaced(shape: IShape, includeMarked: boolean = false): boolean {
        for (let i = 0; i < 9; i++) {
            if (9 - shape.width < i) {
                continue;
            }
            for (let j = 0; j < 9; j++) {
                if (9 - shape.height < j) {
                    continue;
                }
                if (this.canDropShape(shape, { x: i, y: j }, includeMarked)) {
                    return true;
                }
            }
        }
        return false;
    }

    private addToScore(n: number) {
        this.score += n;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(this.gameMode.name + '_highScore', this.highScore.toString(10));
        }
    }

    private checkEliminationMarking(): number {
        let eliminations = 0;
        for (let i = 0; i < 9; i++) {
            let allMarkedX = true;
            let allMarkedY = true;
            for (let j = 0; j < 9; j++) {
                if (!this.gameField[i][j].placed && !this.gameField[i][j].marked) {
                    allMarkedX = false;
                }
                if (!this.gameField[j][i].placed && !this.gameField[j][i].marked) {
                    allMarkedY = false;
                }
            }
            if (allMarkedX) {
                eliminations++;
                for (let j = 0; j < 9; j++) {
                    this.gameField[i][j].highlighted = true;
                }
            }
            if (allMarkedY) {
                eliminations++;
                for (let j = 0; j < 9; j++) {
                    this.gameField[j][i].highlighted = true;
                }
            }
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {

                let allMarked = true;

                for (let ii = 0; ii < 3; ii++) {
                    for (let jj = 0; jj < 3; jj++) {
                        if (!this.gameField[i * 3 + ii][j * 3 + jj].placed && !this.gameField[i * 3 + ii][j * 3 + jj].marked) {
                            allMarked = false;
                        }
                    }
                }
                if (allMarked) {
                    eliminations++;
                    for (let ii = 0; ii < 3; ii++) {
                        for (let jj = 0; jj < 3; jj++) {
                            this.gameField[i * 3 + ii][j * 3 + jj].highlighted = true;
                        }
                    }
                }

            }
        }

        return eliminations;
    }

    private eliminateHighlighted(): number {
        let eliminated = 0;
        let animationProgressOffset = 37;
        let animationStartField = [9, 9];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.gameField[i][j].highlighted) {
                    if (animationStartField[0] + animationStartField[1] > i + j) {
                        animationStartField = [i, j];
                    }
                }
            }
        }
        let animationStartOffset = animationStartField[0] + animationStartField[1];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.gameField[i][j].highlighted) {
                    this.gameField[i][j].highlighted = false;
                    this.gameField[i][j].placed = false;
                    this.gameField[i][j].marked = false;
                    this.gameField[i][j].removed = true;
                    this.gameField[i][j].animationProgress = (animationStartOffset - i - j) * animationProgressOffset;
                    eliminated++;
                }
            }
        }
        return eliminated;
    }

    private canDropAnyOfNextShapes(): boolean {
        for (let shape of this.nextShapes) {
            if (!shape.shape) {
                continue;
            }
            if (this.shapeCanBePlaced(shape.shape)) {
                return true;
            }
        }
        return false;
    }

    private performChecksAfterPlaced(placedAmount: number) {
        let eliminations = this.checkEliminationMarking();

        let eliminated = this.eliminateHighlighted();

        let scoreIncrease = placedAmount + eliminated + (eliminations * 9);
        if (eliminations > 1) {
            scoreIncrease *= (this.streakMultiplier + eliminations);
        }

        this.addToScore(scoreIncrease);

        if (eliminations === 0) {
            this.streakMultiplier = 0;
        } else {
            this.streakMultiplier += 1;
        }

        this.nextShapes.forEach(x => x.isDragging = false);
        if (this.nextShapes.reduce((acc, val) => acc && !val.shape, true)) {
            this.refillShapes();
        }

        if (!this.canDropAnyOfNextShapes()) {
            this.endGame();
        }
        this.storeGame();
    }

    private getShapeDimension(shape: IShape) {
        return shape.width + shape.height +
            (Math.abs(shape.width - shape.height) / 2);
    }

    private getRandomShape(maxDimension: number, minDimension?: number): IShape {
        let shapesByDimension = this.shapesByMaxDimension.get(maxDimension);
        if (!shapesByDimension) {
            throw new Error(`unknown shape dimension ${maxDimension}`);
        }
        if (minDimension) {
            shapesByDimension = shapesByDimension.filter(x => this.getShapeDimension(x) >= minDimension)
        }
        return shapesByDimension[Math.floor(Math.random() * shapesByDimension.length)];
        // return this.allShapes[Math.floor(Math.random() * this.allShapes.length)];
    }

    private canDropShape(shape: IShape, position: { x: number; y: number; }, includeMarked: boolean = false): boolean {
        for (let field of shape.fields) {
            const x = field.x + position.x;
            const y = field.y + position.y;
            if (x >= 9 || y >= 9) {
                return false;
            }
            if (
                this.gameField[x][y].placed
                || (includeMarked && this.gameField[x][y].marked && !this.gameField[x][y].highlighted)
            ) {
                return false;
            }
        }
        return true;
    }

    private positionIsOnBoard(p: { x: number, y: number }): boolean {
        if (
            p.x < 0
            || p.x >= 9
            || p.y < 0
            || p.y >= 9
        ) {
            return false;
        }
        return true;
    }

    private markShape(shape: IShape, position: { x: number; y: number; }) {
        for (let field of shape.fields) {
            this.gameField[field.x + position.x][field.y + position.y].marked = true;
        }
    }

    private placeShape(shape: IShape, position: { x: number; y: number; }): number {
        for (let field of shape.fields) {
            this.gameField[field.x + position.x][field.y + position.y].placed = true;
        }
        return shape.fields.length;
    }

}
