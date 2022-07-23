import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Game } from 'src/app/game/game';
import { InputHandler } from 'src/app/game/input-handler';
import { Renderer } from 'src/app/game/renderer';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterViewInit {

  debugMode = false;

  private renderer: Renderer | undefined;
  game: Game | undefined;
  private inputHandler: InputHandler | undefined;


  displayScore$ = new BehaviorSubject<number>(0);
  displayHighScore$ = new BehaviorSubject<number>(0);

  gameEnded$: Observable<boolean> | undefined;

  @ViewChild('canvas', { read: ElementRef }) canvas?: ElementRef<HTMLCanvasElement>;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      throw new Error('canvas not found!');
    }
    setInterval(() => this.tick(), 50);

    this.game = new Game();
    this.gameEnded$ = this.game.gameEnded$;
    this.renderer = new Renderer(
      this.canvas.nativeElement,
      this.debugMode,
      this.game,
    );
    this.inputHandler = new InputHandler(this.game, this.renderer);
    this.inputHandler.setupListeners(this.canvas.nativeElement);
    this.renderer.setCanvasSize();
    this.game.initGame();
    this.renderer.draw();
  }

  tick() {
    if (!this.game) {
      throw new Error('Game not initialized.');
    }
    this.updateDisplayCounter(this.game.score, this.displayScore$);
    this.updateDisplayCounter(this.game.highScore, this.displayHighScore$);
    this.game.tick();
  }

  updateDisplayCounter(goal: number, display$: BehaviorSubject<number>): void {
    if (goal > display$.value) {
      let inc = (goal - display$.value) / 5;
      if (inc < 1) {
        inc = 1;
      }
      inc = Math.floor(inc);
      display$.next(display$.value + inc);
    }
  }

}
