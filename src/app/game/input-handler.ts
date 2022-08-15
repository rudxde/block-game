import { filter, fromEvent, Observable, takeUntil } from 'rxjs';
import { GameInstanceService } from '../services/game-instance.service';
import { Renderer } from './renderer';

export class InputHandler {

    dragPosition = { x: 0, y: 0 };

    constructor(
        private gameInstanceService: GameInstanceService,
        private renderer: Renderer,
        private destroy$: Observable<void>,
    ) { }

    setupListeners(canvas: HTMLCanvasElement) {
        fromEvent(window, 'resize')
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.renderer.setCanvasSize());
        fromEvent(window, 'pointermove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((e) => {
                e.preventDefault();
            });
        fromEvent(canvas, 'pointerdown')
            .pipe(
                filter<Event, PointerEvent>((e): e is PointerEvent => e instanceof PointerEvent),
                takeUntil(this.destroy$),
            )
            .subscribe((e) => {
                e.preventDefault();
                this.pointerDown(e.offsetX, e.offsetY);
            });
        fromEvent(canvas, 'pointerup')
            .pipe(
                filter<Event, PointerEvent>((e): e is PointerEvent => e instanceof PointerEvent),
                takeUntil(this.destroy$),
            )
            .subscribe((e) => {
                e.preventDefault();
                this.pointerUp(e.offsetX, e.offsetY);
            });
        fromEvent(canvas, 'pointermove')
            .pipe(
                filter<Event, PointerEvent>((e): e is PointerEvent => e instanceof PointerEvent),
                takeUntil(this.destroy$),
            )
            .subscribe((e) => {
                e.preventDefault();
                this.pointerMove(e.offsetX, e.offsetY);
            });
        fromEvent(canvas, 'touchstart')
            .pipe(takeUntil(this.destroy$))
            .subscribe((e) => {
                e.preventDefault();
            });
        fromEvent(canvas, 'touchend')
            .pipe(takeUntil(this.destroy$))
            .subscribe((e) => {
                e.preventDefault();
            });
        fromEvent(canvas, 'touchmove')
            .pipe(takeUntil(this.destroy$))
            .subscribe((e) => {
                e.preventDefault();
            });
    }

    pointerMove(x: number, y: number) {
        const xTranslation = this.renderer.getXTranslation();
        this.dragPosition = { x: x - xTranslation, y };
        this.renderer.setDragPosition(this.dragPosition.x, this.dragPosition.y);

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
        const xTranslation = this.renderer.getXTranslation();
        this.dragPosition = { x: x - xTranslation, y };
        this.renderer.setDragPosition(x - xTranslation, y);
        if (y < this.renderer.width + 16) {
            return;
        }
        this.pointerUp(x, y);
        let selectedNextOne = Math.floor(3 * (x - xTranslation) / this.renderer.width);
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
