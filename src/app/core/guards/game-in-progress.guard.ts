import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';

export const gameInProgressGuard: CanActivateFn = () => {
  const gameState = inject(GameStateService);
  const router = inject(Router);

  if (gameState.players().length >= 2) {
    return true;
  }
  return router.createUrlTree(['/setup']);
};
