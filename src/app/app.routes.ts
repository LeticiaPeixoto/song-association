import { Routes } from '@angular/router';
import { gameInProgressGuard } from './core/guards/game-in-progress.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'setup', pathMatch: 'full' },
  {
    path: 'setup',
    loadComponent: () => import('./features/setup/setup.component').then((m) => m.SetupComponent),
  },
  {
    path: 'transicao',
    loadComponent: () =>
      import('./features/transition/transition.component').then((m) => m.TransitionComponent),
    canActivate: [gameInProgressGuard],
  },
  {
    path: 'jogo',
    loadComponent: () => import('./features/game/game.component').then((m) => m.GameComponent),
    canActivate: [gameInProgressGuard],
  },
  {
    path: 'ranking',
    loadComponent: () => import('./features/ranking/ranking.component').then((m) => m.RankingComponent),
    canActivate: [gameInProgressGuard],
  },
  { path: '**', redirectTo: 'setup' },
];
