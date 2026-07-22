import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { ConfettiCanvasComponent } from './components/confetti-canvas/confetti-canvas.component';
import { RankCardComponent } from './components/rank-card/rank-card.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RankCardComponent, ConfettiCanvasComponent],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss',
})
export class RankingComponent {
  private readonly gameState = inject(GameStateService);
  private readonly router = inject(Router);

  readonly rankedPlayers = this.gameState.rankedPlayers;
  readonly stats = this.gameState.stats;
  readonly round = this.gameState.round;

  readonly winner = computed(() => this.rankedPlayers()[0] ?? null);
  readonly tiedWinners = computed(() => this.rankedPlayers().filter((p) => p.rank === 1));

  readonly subtitle = computed(() => {
    const tied = this.tiedWinners();
    if (tied.length > 1) {
      return `Empate entre ${tied.map((p) => p.name).join(' e ')}!`;
    }
    return `Vencedor: ${this.winner()?.name ?? ''}!`;
  });

  readonly showConfetti = computed(() => (this.winner()?.score ?? 0) > 0 && this.tiedWinners().length === 1);

  readonly roundsPlayed = computed(() => Math.max(this.round() - 1, 0));

  playAgain(): void {
    this.gameState.restartWithSamePlayers();
    this.router.navigate(['/transicao'], { queryParams: { first: '1' } });
  }

  newPlayers(): void {
    this.gameState.resetPlayers();
    this.router.navigate(['/setup']);
  }
}
