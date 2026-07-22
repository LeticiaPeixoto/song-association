import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-actions.component.html',
  styleUrl: './game-actions.component.scss',
})
export class GameActionsComponent {
  @Input() running = false;

  @Output() pass = new EventEmitter<void>();
}
