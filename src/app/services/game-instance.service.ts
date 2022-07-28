import { Injectable } from '@angular/core';
import { Game } from '../game/game';

@Injectable({
    providedIn: 'root'
})
export class GameInstanceService {

    private gameInstance: Game | undefined;

    constructor() { }

    setGame(game: Game) {
        this.gameInstance = game;
    }

    get game(): Game {
        if (!this.gameInstance) {
            throw new Error('No Game initialized!');
        }
        return this.gameInstance;
    }

}
