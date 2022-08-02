import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Game, IField, IStoredGame } from '../game/game';
import { migrateStore } from '../game/migrate-store';
import { gameModeFactory } from '../game/modes/mode-factory';

@Injectable({
    providedIn: 'root'
})
export class GameInstanceService {

    private gameInstance: Game | undefined;

    public readonly gameEnded$ = new BehaviorSubject<boolean>(false);
    public readonly nextGameStarted$ = new Subject<void>();

    constructor() { 
        (window as any)['game'] = () => this.game;
    }

    loadGame(mode: string): Game {
        migrateStore()
        const gameMode = gameModeFactory(mode);
        const storedGameJson = localStorage.getItem(gameMode.name + '_store');
        if (!storedGameJson) {
            return this.newGame(mode);
        }
        let storedGame: IStoredGame = JSON.parse(storedGameJson);
        let game = new Game(
            gameMode,
            storedGame.gameField,
            storedGame.nextShapes,
            storedGame.score,
            storedGame.streakMultiplier,
        );
        this.gameInstance = game;
        this.subscribeToGameEnd();
        game.gameEnded$.next(storedGame.gameEnded);
        return game;
    }

    newGame(mode: string): Game {
        const gameField = new Array(9).fill(undefined).map((_, x) => new Array(9).fill(undefined).map((_, y) => (<IField>{
            x,
            y,
            placed: false,
            highlighted: false,
            marked: false,
            removed: false,
        })));
        let game = new Game(
            gameModeFactory(mode),
            gameField,
        );
        this.gameInstance = game;
        this.subscribeToGameEnd();
        game.gameEnded$.next(false);
        game.storeGame();
        return game;
    }

    get game(): Game {
        if (!this.gameInstance) {
            throw new Error('No Game initialized!');
        }
        return this.gameInstance;
    }

    private subscribeToGameEnd() {
        this.nextGameStarted$.next();
        this.game.gameEnded$
            .pipe(takeUntil(this.nextGameStarted$))
            .subscribe({
                next: v => this.gameEnded$.next(v)
            });
    }

}
