import { cellSizeOfWidth, draggingOffsetY, fieldBaseColor, fieldDisabledColor, fieldHighlightColor, fieldInnerBorderColor, fieldLineColor, fieldMarkedColor, fieldOuterBorderColor, markedFieldOuterBorderColor, sectorLineColor } from './constants';
import { Game } from './game';
import { IShape } from './shapes';

export class Renderer {

    ctx: CanvasRenderingContext2D;
    public width: number = 0;
    public height: number = 0;

    dragPosition = { x: 0, y: 0 };

    constructor(
        private canvas: HTMLCanvasElement,
        private debugMode: boolean,
        private game: Game,

    ) {
        let ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('could not get 2d rendering context.');
        }
        this.ctx = ctx;
    }


    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGameField();
        this.drawNextShapes();
        this.drawDraggingShape();
        requestAnimationFrame(() => this.draw());
    }

    drawGameField() {
        let w = this.width;

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
        this.ctx.strokeStyle = fieldLineColor;
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
        this.ctx.strokeStyle = sectorLineColor;
        this.ctx.lineWidth = 2;
        for (let i = 0; i <= 1; i += cellSizeOfWidth * 3) {
            let w = Math.round(i * 1000) / 1000;
            line(true, w);
            line(false, w);
        }
        this.ctx.stroke();
        this.ctx.closePath();


        for (let x = 0; x < this.game.gameField.length; x++) {
            for (let y = 0; y < this.game.gameField[x].length; y++) {
                this.drawField(x, y);
            }
        }


    }

    drawField(x: number, y: number) {
        let w = this.width;

        let field = this.game.gameField[x][y];
        if (!field.placed && !field.marked && (!field.removed && field.animationProgress !== 100)) {
            return;
        }
        this.ctx.fillStyle = fieldBaseColor;
        if (field.marked) {
            this.ctx.fillStyle = fieldMarkedColor;
        }
        if (field.highlighted) {
            this.ctx.fillStyle = fieldHighlightColor;
        }

        let size = 1;
        if (field.removed && field.animationProgress) {
            size -= field.animationProgress / 100;
        }


        let x1 = (x / 9) * w + (cellSizeOfWidth * w * (1 - size) / 2);
        let y1 = (y / 9) * w + (cellSizeOfWidth * w * (1 - size) / 2);
        this.ctx.fillRect(x1, y1, cellSizeOfWidth * w * size, cellSizeOfWidth * w * size);

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = fieldOuterBorderColor;
        if (field.marked) {
            this.ctx.strokeStyle = markedFieldOuterBorderColor;
        }
        this.ctx.strokeRect(x1, y1, cellSizeOfWidth * w * size, cellSizeOfWidth * w * size);
        if (field.marked) {
            // don't draw border for marked fields
            return;
        }
        this.ctx.strokeStyle = fieldInnerBorderColor;
        this.ctx.strokeRect(x1 + 1, y1 + 1, cellSizeOfWidth * w * size - 2, cellSizeOfWidth * w * size - 2);
        if (this.debugMode) {
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeText(size.toString(10), x1, y1 + 10);
        }
    }

    drawNextShapes() {
        let w = this.width;
        let previewSize = (w / 3) - 16;
        let offsetY = w + 16;

        if (this.debugMode) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#555';
            this.ctx.lineWidth = 0.5;
            for (let i = 0; i < this.game.nextShapes.length; i++) {
                let x = i * (previewSize + 16) + 16;
                let y = offsetY;
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + previewSize, y);
                this.ctx.lineTo(x + previewSize, y + previewSize);
                this.ctx.lineTo(x, y + previewSize);
                this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // let offsetY = w;
        for (let i = 0; i < this.game.nextShapes.length; i++) {
            let shape = this.game.nextShapes[i];
            if (!shape.shape || shape.isDragging) {
                continue;
            }
            const largestDimension = shape.shape.height > shape.shape.width ? shape.shape.height : shape.shape.width;
            // let offsetX = 0;
            let shapeCellSize = (previewSize / largestDimension);
            if (largestDimension === 2) {
                shapeCellSize *= 0.66;
            }
            if (largestDimension === 1) {
                shapeCellSize *= 0.33;
            }
            let offsetX = i * (previewSize + 16) + ((previewSize - (shapeCellSize * shape.shape.width)) / 2) + 16;

            let shapeIsDisabled = (!this.game.shapeCanBePlaced(shape.shape)) || this.game.gameEnded$.value;

            this.drawShape(shape.shape, shapeCellSize, offsetX, offsetY, shapeIsDisabled);
        }
    }

    private drawShape(shape: IShape, shapeCellSize: number, offsetX: number, offsetY: number, disabled: boolean = false) {
        if (this.debugMode) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(`id: ${shape.id}`, offsetX, offsetY);
        }
        for (let field of shape.fields) {
            let x = (field.x * shapeCellSize) + offsetX;
            let y = (field.y * shapeCellSize) + offsetY;
            if (disabled) {
                this.ctx.fillStyle = fieldDisabledColor;
            } else {
                this.ctx.fillStyle = fieldBaseColor;
            }
            this.ctx.fillRect(x, y, shapeCellSize, shapeCellSize);

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = fieldOuterBorderColor;
            this.ctx.strokeRect(x, y, shapeCellSize, shapeCellSize);
            this.ctx.strokeStyle = fieldInnerBorderColor;
            this.ctx.strokeRect(x + 1, y + 1, shapeCellSize - 2, shapeCellSize - 2);

            if (this.debugMode) {
                this.ctx.fillStyle = '#FFF';
                this.ctx.fillText(`${field.x}|${field.y} (${shape.width}|${shape.height})`, x, y + 10);
            }
        }
    }

    drawDraggingShape() {
        for (let shape of this.game.nextShapes) {
            if (!shape.shape || !shape.isDragging) {
                continue;
            }
            let offsetX = this.dragPosition.x - (shape.shape.width * cellSizeOfWidth * this.width / 2);
            let offsetY = this.dragPosition.y - (shape.shape.height * cellSizeOfWidth * this.width) + draggingOffsetY;
            this.drawShape(shape.shape, this.width * cellSizeOfWidth, offsetX, offsetY);
        }
    }


    setCanvasSize() {
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
        this.canvas.height = height;
        this.canvas.width = width;
        this.height = height;
        this.width = width;
    }

    getDraggingCellPosition(dragging: IShape): { x: number, y: number } {
        let basePositionX = this.dragPosition.x - (dragging.width * cellSizeOfWidth * this.width / 2);
        let basePositionY = this.dragPosition.y - (dragging.height * cellSizeOfWidth * this.width) + draggingOffsetY;
        return {
            x: Math.round(basePositionX / (this.width * cellSizeOfWidth)),
            y: Math.round(basePositionY / (this.width * cellSizeOfWidth))
        }
    }

}