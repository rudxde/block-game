import { IGameMode } from '.';
import { BabyGameMode } from './baby';
import { DefaultGameMode } from './default';
import { ExtremeGameMode } from './extreme';

export function gameModeFactory(mode: string): IGameMode {
    switch (mode) {
        case 'default':
            return new DefaultGameMode();
        case 'baby':
            return new BabyGameMode();
        case 'extreme':
            return new ExtremeGameMode();
        default:
            throw new Error('unknown game mode ' + mode);
    }
}