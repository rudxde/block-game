import { cellSizeOfWidth } from './constants';
import { IShape } from './shapes';
import { HermiteInterpolation } from 'interpolations';
import { GameInstanceService } from '../services/game-instance.service';
import { animationFrameScheduler, filter, interval, map, Observable, takeUntil } from 'rxjs';
import { GameTheme } from './game-theme';
import { IGameSettings } from '../services/game-settings.service';

export class Renderer {

    ctx: CanvasRenderingContext2D;
    public width: number = 0;
    public height: number = 0;
    public viewWidth: number = 0;
    public viewHeight: number = 0;

    private dragPosition = { x: 0, y: 0 };

    private lowFPSMode: boolean = false;

    lastGameStateProgress: number = -1;

    constructor(
        private canvas: HTMLCanvasElement,
        private debugMode: boolean,
        private gameInstanceService: GameInstanceService,
        private destroy$: Observable<void>,
        private gameTheme: GameTheme,
        private gameSettings: IGameSettings,
    ) {
        let ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('could not get 2d rendering context.');
        }
        this.ctx = ctx;
    }

    startDrawing() {
        interval(0, animationFrameScheduler)
            .pipe(
                map(x => [x % 4 === 0, x % 200 === 0]),
                filter(([isLowFpsFrame]) => !this.lowFPSMode || isLowFpsFrame),
                takeUntil(this.destroy$),
            )
            .subscribe(([_, isIdleFrame]) => {
                let gameIsIdle = true;
                if (this.lastGameStateProgress !== this.gameInstanceService.game.stateProgress) {
                    this.lastGameStateProgress = this.gameInstanceService.game.stateProgress;
                    gameIsIdle = false;
                }
                if (gameIsIdle && !isIdleFrame) {
                    return;
                }
                this.draw();
            });
    }

    setDragPosition(x?: number, y?: number) {
        this.lastGameStateProgress = -1;
        if (x) {
            this.dragPosition.x = x;
        }
        if (y) {
            this.dragPosition.y = y;
        }
    }

    setCanvasSize() {
        this.lastGameStateProgress = -1;
        let padding = 16;
        if (!this.canvas) {
            throw new Error('canvas not found!');
        }
        let height = window.innerHeight;
        let width = window.innerWidth;
        height -= padding * 2;
        width -= padding * 2;
        if (width > 500) {
            width = 500;
        }
        if (height > 700) {
            height = 700;
        }
        if (width > height - 200) {
            width = height - 200;
        } else {
            height = width + 200;
        }
        // this.canvas.height = height;
        // this.canvas.width = width;
        const scoreHeight = 104 + 16;
        const toolbarHeigh = 48;
        this.viewHeight = window.innerHeight - scoreHeight - toolbarHeigh;
        this.viewWidth = window.innerWidth;
        this.canvas.height = this.viewHeight;
        this.canvas.width = this.viewWidth;
        this.height = height;
        this.width = width;
    }

    getDraggingCellPosition(dragging: IShape): { x: number, y: number } {
        let basePositionX = this.dragPosition.x - (dragging.width * cellSizeOfWidth * this.width / 2);
        let basePositionY = this.dragPosition.y - (dragging.height * cellSizeOfWidth * this.width) - this.gameSettings.draggingOffset;
        return {
            x: Math.round(basePositionX / (this.width * cellSizeOfWidth)),
            y: Math.round(basePositionY / (this.width * cellSizeOfWidth))
        }
    }

    public getXTranslation() {
        return (this.viewWidth - this.width) / 2;
    }

    private draw() {
        const xTranslation = this.getXTranslation();
        this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
        this.ctx.translate(xTranslation, 0);
        this.drawGameField();


        this.drawNextShapes();
        this.drawDraggingShape();


        this.ctx.translate(-xTranslation, 0);
    }




    private drawGameField() {
        let w = this.width;
        this.ctx.clearRect(0, 0, this.viewWidth, this.width);

        const line = (horizontal: boolean, position: number): void => {
            if (horizontal) {
                this.ctx.moveTo(position * w, 0);
                this.ctx.lineTo(position * w, 1 * w);
            } else {
                this.ctx.moveTo(0, position * w);
                this.ctx.lineTo(1 * w, position * w);
            }
        }

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.gameTheme.getTheme().fieldLineColor.hex();
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= 1; i += cellSizeOfWidth) {
            let w = Math.round(i * 1000) / 1000;
            line(true, w);
            line(false, w);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;



        this.ctx.beginPath();
        this.ctx.strokeStyle = this.gameTheme.getTheme().sectorLineColor.hex();
        this.ctx.lineWidth = 2;
        for (let i = 0; i <= 1; i += cellSizeOfWidth * 3) {
            let w = Math.round(i * 1000) / 1000;
            line(true, w);
            line(false, w);
        }
        this.ctx.stroke();
        this.ctx.closePath();


        for (let x = 0; x < this.gameInstanceService.game.gameField.length; x++) {
            for (let y = 0; y < this.gameInstanceService.game.gameField[x].length; y++) {
                this.drawField(x, y);
            }
        }


    }

    private drawField(x: number, y: number) {
        let w = this.width;

        let field = this.gameInstanceService.game.gameField[x][y];
        if (!field.placed && !field.marked && (!field.removed && field.animationProgress !== 100)) {
            return;
        }
        this.ctx.fillStyle = this.gameTheme.getTheme().fieldBaseColor.hex();
        if (field.marked) {
            this.ctx.fillStyle = this.gameTheme.getTheme().fieldMarkedColor.hex();
        }
        if (field.highlighted) {
            this.ctx.fillStyle = this.gameTheme.getTheme().fieldHighlightColor.hex();
        }

        let size = 1;
        if (field.removed && (field.animationProgress ?? 0) > 0) {
            size -= field.animationProgress! / 100;
        }


        let x1 = (x / 9) * w + (cellSizeOfWidth * w * (1 - size) / 2);
        let y1 = (y / 9) * w + (cellSizeOfWidth * w * (1 - size) / 2);
        let width = cellSizeOfWidth * w * size;

        if (this.gameInstanceService.game.gameStartAnimationProgress < 100) {
            let fullWith = width;
            width *= this.gameInstanceService.game.gameStartAnimationProgress / 100;
            width = Math.floor(width);
            x1 += (fullWith - width) / 2;
            y1 += (fullWith - width) / 2;
        }
        if (this.gameInstanceService.game.gameStartAnimationProgress < 0) {
            return;
        }


        this.ctx.fillRect(x1, y1, width, width);

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.gameTheme.getTheme().fieldOuterBorderColor.hex();
        if (field.marked) {
            this.ctx.strokeStyle = this.gameTheme.getTheme().markedFieldOuterBorderColor.hex();
        }
        this.ctx.strokeRect(x1, y1, width, width);
        if (field.marked) {
            // don't draw border for marked fields
            return;
        }
        this.ctx.strokeStyle = this.gameTheme.getTheme().fieldInnerBorderColor.hex();
        this.ctx.strokeRect(x1 + 1, y1 + 1, width - 2, width - 2);
        if (this.debugMode) {
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeText(size.toString(10), x1, y1 + 10);
        }
    }

    private drawNextShapes() {
        let w = this.width;
        let previewSize = (w / 3) - 16;

        if (this.debugMode) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#555';
            this.ctx.lineWidth = 0.5;
            for (let i = 0; i < this.gameInstanceService.game.nextShapes.length; i++) {
                let x = i * (previewSize + 16) + 8;
                let y = w + 16;
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + previewSize, y);
                this.ctx.lineTo(x + previewSize, y + previewSize);
                this.ctx.lineTo(x, y + previewSize);
                this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            this.ctx.closePath();
        }
        let scale = undefined;
        if (this.gameInstanceService.game.gameStartAnimationProgress < 100) {
            scale = this.gameInstanceService.game.gameStartAnimationProgress / 100;
        }
        if (this.gameInstanceService.game.gameStartAnimationProgress < 0) {
            return;
        }
        for (let i = 0; i < this.gameInstanceService.game.nextShapes.length; i++) {
            let shape = this.gameInstanceService.game.nextShapes[i];
            if (!shape.shape || shape.isDragging) {
                continue;
            }
            const { shapeCellSize, offsetX, offsetY } = this.getPositionOfNextShape(shape.shape, i);
            let shapeIsDisabled = (!this.gameInstanceService.game.shapeCanBePlaced(shape.shape)) || this.gameInstanceService.game.gameEnded$.value;
            let shapeHasWarning = !shapeIsDisabled && !this.gameInstanceService.game.shapeCanBePlaced(shape.shape, true);

            let scaledShapeCellSize = shapeCellSize;
            if (scale) {
                // scaledShapeCellSize *= scale;
            }

            this.drawShape(shape.shape, scaledShapeCellSize, offsetX, offsetY, shapeIsDisabled, scale, shapeHasWarning);
        }
    }

    private getPositionOfNextShape(shape: IShape, index: number): { shapeCellSize: number, offsetX: number, offsetY: number } {
        let w = this.width;
        let previewSize = (w / 3) - 16;
        const largestDimension = shape.height > shape.width ? shape.height : shape.width;
        let shapeCellSize = (previewSize / largestDimension);
        if (largestDimension === 2) {
            shapeCellSize *= 0.66;
        }
        if (largestDimension === 1) {
            shapeCellSize *= 0.33;
        }
        let offsetY = w + 16 + ((previewSize - (shapeCellSize * shape.height)) / 2);
        let offsetX = index * (previewSize + 16) + ((previewSize - (shapeCellSize * shape.width)) / 2) + 8;
        return {
            shapeCellSize,
            offsetX,
            offsetY,
        }
    }

    private drawShape(
        shape: IShape,
        shapeCellSize: number,
        offsetX: number,
        offsetY: number,
        disabled: boolean = false,
        blockScale: number = 1,
        shapeHasWarning: boolean = false
    ): void {
        if (this.debugMode) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(`id: ${shape.id}`, offsetX, offsetY);
        }
        for (let field of shape.fields) {
            let x = (field.x * shapeCellSize) + offsetX + ((1 - blockScale) * 0.5) * shapeCellSize;
            let y = (field.y * shapeCellSize) + offsetY + ((1 - blockScale) * 0.5) * shapeCellSize;
            let scaledShapeCellSize = shapeCellSize * blockScale;
            if (disabled) {
                this.ctx.fillStyle = this.gameTheme.getTheme().fieldDisabledColor.hex();
            } else if (shapeHasWarning) {
                this.ctx.fillStyle = this.gameTheme.getTheme().fieldWarningColor.hex();
            } else {
                this.ctx.fillStyle = this.gameTheme.getTheme().fieldBaseColor.hex();
            }
            this.ctx.fillRect(x, y, scaledShapeCellSize, scaledShapeCellSize);

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.gameTheme.getTheme().fieldOuterBorderColor.hex();
            this.ctx.strokeRect(x, y, scaledShapeCellSize, scaledShapeCellSize);
            this.ctx.strokeStyle = this.gameTheme.getTheme().fieldInnerBorderColor.hex();
            this.ctx.strokeRect(x + 1, y + 1, scaledShapeCellSize - 2, scaledShapeCellSize - 2);

            if (this.debugMode) {
                this.ctx.fillStyle = '#FFF';
                this.ctx.fillText(`${field.x}|${field.y} (${shape.width}|${shape.height})`, x, y + 10);
            }
        }
    }

    pickInterpolations: {
        offsetXInterpolation: HermiteInterpolation;
        offsetYInterpolation: HermiteInterpolation;
        shapeCellSizeInterpolation: HermiteInterpolation;
        blockScaleSizeInterpolation: HermiteInterpolation;
    } | undefined;

    private drawDraggingShape() {
        const draggingShape = this.gameInstanceService.game.getDraggingShape();
        if (!draggingShape || !draggingShape.shape) {
            this.pickInterpolations = undefined;
            return;
        }

        let offsetX = this.dragPosition.x - (draggingShape.shape.width * cellSizeOfWidth * this.width / 2);
        let offsetY = this.dragPosition.y - (draggingShape.shape.height * cellSizeOfWidth * this.width) - this.gameSettings.draggingOffset;
        let shapeCellSize = this.width * cellSizeOfWidth;
        let blockScale = 0.75;
        if (draggingShape.pickAnimation) {
            if (!this.pickInterpolations) {
                let sourcePositions = this.getPositionOfNextShape(draggingShape.shape, draggingShape.index);
                this.pickInterpolations = {
                    offsetXInterpolation: new HermiteInterpolation(0, 100, sourcePositions.offsetX, offsetX),
                    offsetYInterpolation: new HermiteInterpolation(0, 100, sourcePositions.offsetY, offsetY),
                    shapeCellSizeInterpolation: new HermiteInterpolation(0, 100, sourcePositions.shapeCellSize, shapeCellSize),
                    blockScaleSizeInterpolation: new HermiteInterpolation(0, 100, 1, blockScale),
                }
            }
            this.pickInterpolations.offsetXInterpolation.toValue = offsetX;
            this.pickInterpolations.offsetYInterpolation.toValue = offsetY;
            offsetX = this.pickInterpolations.offsetXInterpolation.eval(draggingShape.pickAnimation);
            offsetY = this.pickInterpolations.offsetYInterpolation.eval(draggingShape.pickAnimation);
            shapeCellSize = this.pickInterpolations.shapeCellSizeInterpolation.eval(draggingShape.pickAnimation);
            blockScale = this.pickInterpolations.blockScaleSizeInterpolation.eval(draggingShape.pickAnimation);
        } else {
            this.pickInterpolations = undefined;
        }

        this.drawShape(draggingShape.shape, shapeCellSize, offsetX, offsetY, undefined, blockScale);
    }

}