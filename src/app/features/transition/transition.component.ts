import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-transition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transition.component.html',
  styleUrl: './transition.component.scss',
})
export class TransitionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly gameState = inject(GameStateService);
  private readonly router = inject(Router);

  readonly isFirstTurn = this.route.snapshot.queryParamMap.get('first') === '1';

  readonly players = this.gameState.players;
  readonly round = this.gameState.round;

  readonly label = computed(() => (this.isFirstTurn ? 'Prepare-se' : `Rodada ${this.round()}`));
  // readonly subtitle = computed(() =>
  //   this.isFirstTurn ? 'Todos jogam juntos — boa sorte a todos!' : 'Todos prontos? Vamos à próxima palavra!',
  // );

  ready(): void {
    this.router.navigate(['/jogo']);
  }
}
