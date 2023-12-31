import { Injectable } from '@angular/core';

export interface IGameSettings {
    draggingOffset: number;
}

export const GAME_SETTINGS_KEY = 'gameSettings';

@Injectable({
    providedIn: 'root'
})
export class GameSettingsService {

    setDraggingOffset(value: number): void {
        const gameSettings = this.getGameSettings();
        gameSettings.draggingOffset = value;
        localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(gameSettings));
    }

    getGameSettings(): IGameSettings {
        const localStorageEntry = localStorage.getItem(GAME_SETTINGS_KEY);
        const gameSettings: Partial<IGameSettings> = localStorageEntry ? JSON.parse(localStorageEntry) : {};
        return {
            draggingOffset: gameSettings.draggingOffset ?? 32,
        };
    }
}
