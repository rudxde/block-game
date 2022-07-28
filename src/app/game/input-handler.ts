import { GameInstanceService } from '../services/game-instance.service';
import { Game } from './game';
import { Renderer } from './renderer';

export class InputHandler {

    dragPosition = { x: 0, y: 0 };

    constructor(
        private gameInstanceService: GameInstanceService,
        private renderer: Renderer,
    ) { }

    setupListeners(canvas: HTMLCanvasElement) {
        window.addEventListener('resize', () => this.renderer.setCanvasSize());
        window.addEventListener('pointermove', (e) => {
            e.preventDefault();
        });
        canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.pointerDown(e.offsetX, e.offsetY);
        });
        canvas.addEventListener('pointerup', (e) => {
            e.preventDefault();
            this.pointerUp(e.offsetX, e.offsetY);
        });
        canvas.addEventListener('pointermove', (e) => {
            e.preventDefault();
            this.pointerMove(e.offsetX, e.offsetY);
        });
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // this.pointerDown(e.touches[0].clientX, e.touches[0].clientY + canvas.top);
        });
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            // this.pointerUp(e.clientX, e.offsetY);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            // this.pointerMove(e.clientX, e.offsetY);
        });
    }

    pointerMove(x: number, y: number) {
        this.dragPosition = { x, y };
        this.renderer.dragPosition = this.dragPosition;

        const draggingShape = this.gameInstanceService.game.getDraggingShape();
        if (draggingShape) {
            const position = this.renderer.getDraggingCellPosition(draggingShape.shape!);
            this.gameInstanceService.game.markDraggingShape(draggingShape, position);
        }
    }

    pointerDown(x: number, y: number) {
        if (this.gameInstanceService.game.gameEnded$.value) {
            return;
        }
        this.dragPosition = { x, y };
        this.renderer.dragPosition.x = x;
        this.renderer.dragPosition.y = y;
        if (y < this.renderer.width + 16) {
            return;
        }
        this.pointerUp(x, y);
        let selectedNextOne = Math.floor(3 * x / this.renderer.width);
        this.gameInstanceService.game.setDraggingShape(selectedNextOne);
    }

    pointerUp(x: number, y: number) {
        this.gameInstanceService.game.resetMarkings();

        const draggingShape = this.gameInstanceService.game.getDraggingShape();
        if (!draggingShape) {
            return;
        }
        const position = this.renderer.getDraggingCellPosition(draggingShape.shape!);
        this.gameInstanceService.game.placeDragging(draggingShape, position);
        this.gameInstanceService.game.releaseDraggingShape();
    }

}
