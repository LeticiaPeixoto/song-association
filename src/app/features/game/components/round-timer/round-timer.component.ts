import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-round-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './round-timer.component.html',
  styleUrl: './round-timer.component.scss',
})
export class RoundTimerComponent {
  @Input({ required: true }) timeLeft = 0;
  @Input({ required: true }) total = 30;
  @Input({ required: true }) running = false;
  @Input({ required: true }) paused = false;

  readonly circumference = CIRCUMFERENCE;

  get fraction(): number {
    return this.total > 0 ? this.timeLeft / this.total : 0;
  }

  get dashOffset(): number {
    return CIRCUMFERENCE * (1 - this.fraction);
  }

  get urgent(): boolean {
    return this.timeLeft <= 8 && this.running;
  }

  get statusLabel(): string {
    if (this.paused) return 'pausado';
    if (this.running) return 'rodando…';
    return 'aguardando';
  }
}
