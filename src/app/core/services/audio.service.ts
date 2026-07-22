import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly _isMuted = signal(false);
  readonly isMuted = this._isMuted.asReadonly();

  private audioCtx: AudioContext | null = null;

  /** Alterna o estado de silêncio (mute/unmute). */
  toggleMute(): void {
    this._isMuted.update((m) => !m);
  }

  /** Inicializa e retorna o AudioContext se o som não estiver silenciado. */
  private initCtx(): AudioContext | null {
    if (this._isMuted()) return null;
    
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    return this.audioCtx;
  }

  /** Sintetiza um som curto de tique-taque (frequência média a alta com decaimento exponencial rápido). */
  playTick(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Erro ao reproduzir som de tique-taque:', e);
    }
  }

  /** Sintetiza um som clássico de buzzer/buzina (combinação áspera de ondas dente de serra). */
  playBuzzer(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(140, ctx.currentTime);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(143, ctx.currentTime); // Desafinação sutil para encorpar o som

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Erro ao reproduzir som de buzzer:', e);
    }
  }
}
