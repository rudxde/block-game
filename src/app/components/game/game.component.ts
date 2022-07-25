import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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

  gameEnded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  startNewVerification$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @ViewChild('canvas', { read: ElementRef }) canvas?: ElementRef<HTMLCanvasElement>;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      throw new Error('canvas not found!');
    }
    setInterval(() => this.tick(), 10);

    this.game = new Game();
    this.game.gameEnded$.subscribe(this.gameEnded$);
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

  displayCounterUpdateCoolDown = 0;
  tick() {
    if (!this.game) {
      throw new Error('Game not initialized.');
    }
    if (this.displayCounterUpdateCoolDown === 0) {
      this.updateDisplayCounter(this.game.score, this.displayScore$);
      this.updateDisplayCounter(this.game.highScore, this.displayHighScore$);
      this.displayCounterUpdateCoolDown = 5;
    }
    this.displayCounterUpdateCoolDown--;
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
    } else if (goal < display$.value) {
      display$.next(goal);
    }
  }
  
  newGame(){
    this.startNewVerification$.next(true);
  }
  newGameVerified(){
    if(!this.game) {
      throw new Error(`Game was not initialized!`);
    }
    this.game.newGame();
    this.startNewVerification$.next(false);
  }
  newGameAbort(){
    this.startNewVerification$.next(false);
  }

}
