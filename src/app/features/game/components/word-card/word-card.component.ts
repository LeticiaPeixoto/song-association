import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GameWord } from '../../../../core/models/word.model';

@Component({
  selector: 'app-word-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-card.component.html',
  styleUrl: './word-card.component.scss',
})
export class WordCardComponent {
  @Input() word: GameWord | null = null;
}
