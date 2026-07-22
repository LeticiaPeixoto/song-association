import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-end-game-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end-game-modal.component.html',
  styleUrl: './end-game-modal.component.scss',
})
export class EndGameModalComponent {
  @Input() open = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
