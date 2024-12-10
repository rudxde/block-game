import { Routes } from '@angular/router';
import { ErrorComponent } from './components/error/error.component';
import { GameComponent } from './components/game/game.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: 'game', component: GameComponent },
  { path: 'game/:mode', component: GameComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '', pathMatch: 'full', redirectTo: 'game' },
  { path: '**', component: ErrorComponent, data: { code: 'notFound' } }
];
