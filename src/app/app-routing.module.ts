import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './components/error/error.component';
import { GameComponent } from './components/game/game.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  { path: 'game', component: GameComponent },
  { path: 'game/:mode', component: GameComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'error', component: ErrorComponent },
  { path: '', pathMatch: 'full', redirectTo: 'game' },
  { path: '**', component: ErrorComponent, data: { code: 'notFound' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
