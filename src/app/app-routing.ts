import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'game' },
  { path: 'game', loadComponent: async () => (await import('./components/game/game.component')).GameComponent },
  { path: 'game/:mode', loadComponent: async () => (await import('./components/game/game.component')).GameComponent },
  { path: 'settings', loadComponent: async () => (await import('./components/settings/settings.component')).SettingsComponent },
  { path: '**', loadComponent: async () => (await import('./components/error/error.component')).ErrorComponent, data: { code: 'notFound' } }
];
