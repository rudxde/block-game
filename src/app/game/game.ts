import { BehaviorSubject } from 'rxjs';
import { cellSizeOfWidth, draggingOffsetY } from './constants';
import { getShapes, IShape } from './shapes';

interface IField {
    x: number;
    y: number;
    placed: boolean;
    highlighted: boolean;
    marked: boolean;
    animationProgress?: number;
    removed: boolean;
}

interface IStoredGame {
    score: number;
    gameField: IField[][];
    nextShapes: { shape?: IShape, isDragging: boolean }[];
    gameEnded: boolean;
    streakMultiplier: number;
}


interface IDraggingShape {
    shape?: IShape;
    isDragging: boolean;
}

export class Game {

    height = 0;
    gameField: IField[][] = [];

    nextShapes: IDraggingShape[] = [];

    allShapes: IShape[] = getShapes();

    debugMode = false;


    score = 0;


    streakMultiplier = 1;

    isHighScore = false;
    gameEnded$ = new BehaviorSubject<boolean>(false);



    highScore = 0;
    lastHighScore = 0;

    storeGame() {
        let game: IStoredGame = {
            gameField: this.gameField,
            nextShapes: this.nextShapes,
            score: this.score,
            gameEnded: this.gameEnded$.value,
            streakMultiplier: this.streakMultiplier,
        };
        localStorage.setItem('store', JSON.stringify(game));
    }

    initGame() {
        this.loadStoredGame();
    }

    loadStoredGame() {
        this.highScore = parseInt(localStorage.getItem('highScore') ?? '0');
        const storedGameJson = localStorage.getItem('store');
        if (!storedGameJson) {
            this.newGame();
            return;
        }
        let storedGame: IStoredGame = JSON.parse(storedGameJson);
        this.gameField = storedGame.gameField;
        this.nextShapes = storedGame.nextShapes;
        this.score = storedGame.score;
        this.gameEnded$.next(storedGame.gameEnded);
        this.streakMultiplier = this.streakMultiplier;
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
                this.gameField[i][j].animationProgress = (this.gameField[i][j].animationProgress ?? 0) + 20;
            }
        }
        if (shouldStore) {
            this.storeGame();
        }
    }


    newGame() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.gameField[i][j].highlighted = false;
                this.gameField[i][j].marked = false;
                this.gameField[i][j].placed = false;
                this.gameField[i][j].animationProgress = undefined;
                // this.gameField[i][j].animationProgress = Math.floor(Math.random() * 100);
                this.gameField[i][j].removed = false;
                // this.gameField[i][j].removed = true;
            }
        }
        this.refillShapes();
        this.score = 0;
        this.gameEnded$.next(false);
        this.highScore = parseInt(localStorage.getItem('highScore') ?? '0');
        this.lastHighScore = this.highScore;
        this.storeGame();
    }

    refillShapes() {
        this.nextShapes = [
            { shape: this.getRandomShape(), isDragging: false },
            { shape: this.getRandomShape(), isDragging: false },
            { shape: this.getRandomShape(), isDragging: false },
        ];

        for (let shape of this.nextShapes) {
            if (
                shape.shape!.height + shape.shape!.width < 6
                && shape.shape!.height < 4
                && shape.shape!.width < 4
            ) {
                return;
            }
        }
        this.refillShapes();
    }

    getRandomShape(): IShape {
        return this.allShapes[Math.floor(Math.random() * this.allShapes.length)];
    }

    endGame() {
        const lastHighScore = this.highScore;
        this.isHighScore = this.score > lastHighScore;
        if (this.isHighScore) {
            localStorage.setItem('highScore', this.score.toString(10));
        }
        this.gameEnded$.next(true);
    }

    addToScore(n: number) {
        this.score += n;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore.toString(10));
        }
    }


    resetMarkings() {
        this.gameField.forEach(line => line.forEach(field => {
            field.highlighted = false;
            field.marked = false;
        }));
    }

    placeDragging(draggingShape: IDraggingShape, position: { x: number, y: number }): number {
        let placed = 0;
        this.resetMarkings();
        // let dragging = this.nextShapes.find(x => x.isDragging);
        // if (!dragging) {
        //     return 0;
        // }
        if (!draggingShape.shape) {
            throw new Error('dragging shape has no shape');
        }
        // const position = this.getDraggingCellPosition(dragging.shape, dragPosition);
        if (!this.positionIsOnBoard(position)) {
            return 0;
        }
        if (!this.canDropShape(draggingShape.shape, position)) {
            return 0;
        }
        placed = this.placeShape(draggingShape.shape, position);
        draggingShape.shape = undefined;
        draggingShape.isDragging = false;
        return placed;
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

    private canDropShape(shape: IShape, position: { x: number; y: number; }): boolean {
        for (let field of shape.fields) {
            const x = field.x + position.x;
            const y = field.y + position.y;
            if (x >= 9 || y >= 9) {
                return false;
            }
            if (this.gameField[x][y].placed) {
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



    checkEliminationMarking(): number {
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

    eliminateHighlighted(): number {
        let eliminated = 0;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.gameField[i][j].highlighted) {
                    this.gameField[i][j].highlighted = false;
                    this.gameField[i][j].placed = false;
                    this.gameField[i][j].marked = false;
                    this.gameField[i][j].removed = true;
                    this.gameField[i][j].animationProgress = 0;
                    eliminated++;
                }
            }
        }
        return eliminated;
    }

    canDropAnyOfNextShapes(): boolean {
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

    shapeCanBePlaced(shape: IShape): boolean {
        for (let i = 0; i < 9; i++) {
            if (9 - shape.width < i) {
                continue;
            }
            for (let j = 0; j < 9; j++) {
                if (9 - shape.height < j) {
                    continue;
                }
                if (this.canDropShape(shape, { x: i, y: j })) {
                    return true;
                }
            }
        }
        return false;
    }

    debugShapeCount = 0;
    nextShape() {
        if (this.debugMode) {
            this.nextShapes = [
                { shape: this.allShapes[this.debugShapeCount], isDragging: false },
                { shape: this.allShapes[this.debugShapeCount + 1], isDragging: false },
                { shape: this.allShapes[this.debugShapeCount + 2], isDragging: false },
            ];
            this.debugShapeCount += 3;
            if (this.debugShapeCount >= this.allShapes.length) {
                this.debugShapeCount = 0;
            }
            return;
        }
        this.refillShapes();

    }
}
