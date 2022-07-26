import { IGameMode } from '.';
import { BabyGameMode } from './baby';
import { DefaultGameMode } from './default';

export function gameModeFactory(mode: string): IGameMode {
    switch (mode) {
        case 'default':
            return new DefaultGameMode();
        case 'baby':
            return new BabyGameMode();
        default:
            throw new Error('unknown game mode ' + mode);
    }
}