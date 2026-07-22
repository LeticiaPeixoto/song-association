import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MEDALS } from '../../../../core/constants/game.constants';
import { RankedPlayer } from '../../../../core/models/player.model';

@Component({
  selector: 'app-rank-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rank-card.component.html',
  styleUrl: './rank-card.component.scss',
})
export class RankCardComponent {
  @Input({ required: true }) player!: RankedPlayer;

  get rankClass(): string {
    return this.player.rank <= 3 ? `rank-${this.player.rank}` : 'rank-other';
  }

  get medal(): string {
    return this.player.rank <= 3 ? MEDALS[this.player.rank - 1] : String(this.player.rank);
  }

  get scoreLabel(): string {
    return this.player.score === 1 ? '1 ponto' : `${this.player.score} pontos`;
  }
}
