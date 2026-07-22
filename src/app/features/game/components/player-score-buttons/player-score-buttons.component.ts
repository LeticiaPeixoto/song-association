import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: 'app-player-score-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-score-buttons.component.html',
  styleUrl: './player-score-buttons.component.scss',
})
export class PlayerScoreButtonsComponent {
  @Input({ required: true }) players: Player[] = [];
  @Input() scoredIds: ReadonlySet<number> = new Set();

  /** Emite o id do jogador clicado; quem escuta decide se soma ou remove o ponto. */
  @Output() toggle = new EventEmitter<number>();

  isScored(id: number): boolean {
    return this.scoredIds.has(id);
  }
}
