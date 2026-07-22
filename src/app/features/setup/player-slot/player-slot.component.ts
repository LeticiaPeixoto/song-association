import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { COLOR_CLASSES, DEFAULT_NAMES } from '../../../core/constants/game.constants';

@Component({
  selector: 'app-player-slot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player-slot.component.html',
  styleUrl: './player-slot.component.scss',
})
export class PlayerSlotComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input({ required: true }) index = 0;
  @Input() removable = true;

  @Output() remove = new EventEmitter<void>();

  get colorClass(): string {
    return COLOR_CLASSES[this.index];
  }

  get placeholder(): string {
    return DEFAULT_NAMES[this.index];
  }
}
