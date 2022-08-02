import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, interval, Subject, takeUntil } from 'rxjs';
import { InputHandler } from 'src/app/game/input-handler';
import { Renderer } from 'src/app/game/renderer';
import { GameInstanceService } from 'src/app/services/game-instance.service';
import { MenuBarService } from 'src/app/services/menu-bar.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {

  debugMode = false;

  private renderer: Renderer | undefined;
  private inputHandler: InputHandler | undefined;


  displayScore$ = new BehaviorSubject<number>(0);
  displayHighScore$ = new BehaviorSubject<number>(0);

  gameEnded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  startNewVerification$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  destroy$ = new Subject<void>();

  @ViewChild('canvas', { read: ElementRef }) canvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private menuBarService: MenuBarService,
    public gameInstanceService: GameInstanceService,
  ) { }

  ngOnInit(): void {
    this.gameInstanceService.gameEnded$.subscribe(this.gameEnded$);
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          let mode: string = this.getMode();
          this.gameInstanceService.loadGame(mode);
        }
      });
  }

  private getMode() {
    const params = this.activatedRoute.snapshot.params;
    let mode: string = 'default';
    if (params['mode']) {
      mode = params['mode'];
    }
    this.menuBarService.set(
      (mode === 'default' ? undefined : mode),
      {
        icon: 'replay',
        title: 'new Game',
        click: () => this.askVerificationForNewGame(),
      }
    );
    return mode;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      throw new Error('canvas not found!');
    }
    this.renderer = new Renderer(
      this.canvas.nativeElement,
      this.debugMode,
      this.gameInstanceService,
      this.destroy$,
    );
    this.inputHandler = new InputHandler(this.gameInstanceService, this.renderer, this.destroy$);
    this.inputHandler.setupListeners(this.canvas.nativeElement);
    this.renderer.setCanvasSize();
    this.renderer.startDrawing();

    interval(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: this.tick.bind(this)
      })
  }

  displayCounterUpdateCoolDown = 0;
  tick() {
    if (this.displayCounterUpdateCoolDown === 0) {
      this.updateDisplayCounter(this.gameInstanceService.game.score, this.displayScore$);
      this.updateDisplayCounter(this.gameInstanceService.game.highScore, this.displayHighScore$);
      this.displayCounterUpdateCoolDown = 5;
    }
    this.displayCounterUpdateCoolDown--;
    this.gameInstanceService.game.tick();
  }

  updateDisplayCounter(goal: number, display$: BehaviorSubject<number>): void {
    if (goal > display$.value) {
      let inc = (goal - display$.value) / 5;
      if (inc < 1) {
        inc = 1;
      }
      inc = Math.floor(inc);
      display$.next(display$.value + inc);
    } else if (goal < display$.value) {
      display$.next(goal);
    }
  }

  askVerificationForNewGame() {
    this.startNewVerification$.next(true);
  }

  newGame() {
    this.gameInstanceService.newGame(this.getMode());
    this.startNewVerification$.next(false);
  }

  newGameAbort() {
    this.startNewVerification$.next(false);
  }

}
