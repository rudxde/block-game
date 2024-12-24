import { AfterViewInit, Component, computed, effect, ElementRef, OnDestroy, OnInit, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, filter, interval, Observable, Subject, takeUntil } from 'rxjs';
import { GameTheme } from 'src/app/game/game-theme';
import { InputHandler } from 'src/app/game/input-handler';
import { Renderer } from 'src/app/game/renderer';
import { GameInstanceService } from 'src/app/services/game-instance.service';
import { MenuBarService } from 'src/app/services/menu-bar.service';
import { ThemeService } from 'src/app/services/theme.service';
import { GameSettingsService } from '../../services/game-settings.service';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, AsyncPipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  imports: [TranslocoModule, NgIf, MatButtonModule]
})
export class GameComponent implements AfterViewInit, OnDestroy {

  debugMode = false;

  private renderer: Renderer | undefined;
  private inputHandler: InputHandler | undefined;


  displayScore = signal<number>(0);
  displayHighScore = signal<number>(0);

  gameEnded = toSignal(this.gameInstanceService.gameEnded$);
  startNewVerification = signal(false);
  destroy$ = new Subject<void>();
  activatedRouteParams = toSignal(this.activatedRoute.params, { requireSync: true });
  mode = computed(() => {
    const params = this.activatedRouteParams();
    const modeParam = params['mode'];
    if (modeParam && typeof modeParam === 'string') {
      return modeParam;
    }
    return 'default';
  });

  loadGame = effect(() => {
    const mode = this.mode();
    this.menuBarService.set(
      (mode === 'default' ? undefined : mode),
      {
        icon: 'replay',
        title: 'new Game',
        click: () => this.askVerificationForNewGame(),
      }
    );
    this.gameInstanceService.loadGame(mode);
  })

  @ViewChild('canvas', { read: ElementRef }) canvas?: ElementRef<HTMLCanvasElement>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private menuBarService: MenuBarService,
    public gameInstanceService: GameInstanceService,
    private themeService: ThemeService,
    private gameSettingsService: GameSettingsService,
  ) { }


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
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      throw new Error('canvas not found!');
    }

    const gameTheme = new GameTheme(this.themeService, this.debugMode);

    this.renderer = new Renderer(
      this.canvas.nativeElement,
      this.debugMode,
      this.gameInstanceService,
      this.destroy$,
      gameTheme,
      this.gameSettingsService.getGameSettings(),
    );
    this.inputHandler = new InputHandler(this.gameInstanceService, this.renderer, this.destroy$);
    this.inputHandler.setupListeners(this.canvas.nativeElement);
    this.renderer.setCanvasSize();
    this.renderer.startDrawing();

    interval(10)
      .pipe(
        filter(() => this.gameInstanceService.gameInitialized()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.tick(),
      })
  }

  displayCounterUpdateCoolDown = 0;
  tick() {
    if (this.displayCounterUpdateCoolDown === 0) {
      this.updateDisplayCounter(this.gameInstanceService.game.score, this.displayScore);
      this.updateDisplayCounter(this.gameInstanceService.game.highScore, this.displayHighScore);
      this.displayCounterUpdateCoolDown = 5;
    }
    this.displayCounterUpdateCoolDown--;
    this.gameInstanceService.game.tick();
  }

  updateDisplayCounter(goal: number, display: WritableSignal<number>): void {
    if (goal > display()) {
      let inc = (goal - display()) / 5;
      if (inc < 1) {
        inc = 1;
      }
      inc = Math.floor(inc);
      display.set(display() + inc);
    } else if (goal < display()) {
      display.set(goal);
    }
  }

  askVerificationForNewGame() {
    this.startNewVerification.set(true);
  }

  newGame() {
    this.gameInstanceService.newGame(this.getMode());
    this.startNewVerification.set(false);
  }

  newGameAbort() {
    this.startNewVerification.set(false);
  }

}
