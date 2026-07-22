import { Injectable, inject, signal } from '@angular/core';
import { AudioService } from './audio.service';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly audioService = inject(AudioService);

  private readonly _total = signal(30);
  private readonly _timeLeft = signal(30);
  private readonly _running = signal(false);
  private readonly _paused = signal(false);

  readonly total = this._total.asReadonly();
  readonly timeLeft = this._timeLeft.asReadonly();
  readonly running = this._running.asReadonly();
  readonly paused = this._paused.asReadonly();

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onExpire: (() => void) | null = null;

  /** Configura a duração total (segundos) de cada rodada. */
  setTotal(seconds: number): void {
    this._total.set(seconds);
  }

  /** Inicia a contagem do zero, chamando `onExpire` quando o tempo acabar. */
  start(onExpire: () => void): void {
    this.clear();
    this.onExpire = onExpire;
    this._timeLeft.set(this._total());
    this._running.set(true);
    this._paused.set(false);
    this.tick();
  }

  /** Pausa a contagem manualmente, se necessário. */
  stop(): void {
    this.clear();
    this._running.set(false);
    this._paused.set(true);
  }

  /** Retoma a contagem de onde parou. */
  resume(): void {
    this.clear();
    this._paused.set(false);
    this._running.set(true);
    this.tick();
  }

  /** Reseta o temporizador para o estado inicial (parado, tempo cheio). */
  reset(): void {
    this.clear();
    this._running.set(false);
    this._paused.set(false);
    this._timeLeft.set(this._total());
  }

  private tick(): void {
    this.intervalId = setInterval(() => {
      const current = this._timeLeft();
      if (current <= 0) {
        this.clear();
        this._running.set(false);
        this.audioService.playBuzzer();
        this.onExpire?.();
        return;
      }
      
      const nextVal = current - 1;
      this._timeLeft.set(nextVal);
      
      if (nextVal > 0 && nextVal <= 5) {
        this.audioService.playTick();
      }
    }, 1000);
  }

  private clear(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
