import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  rot: number;
  vx: number;
  vy: number;
  vr: number;
}

const COLORS = ['#3D8B00', '#5340C8', '#D93553', '#F5D547', '#FF8C42', '#4ECDC4'];
const PIECE_COUNT = 120;
const DURATION_MS = 3500;

@Component({
  selector: 'app-confetti-canvas',
  standalone: true,
  template: `<canvas #canvas class="confetti-canvas"></canvas>`,
  styles: [
    `
      .confetti-canvas {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 400;
      }
    `,
  ],
})
export class ConfettiCanvasComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() play = false;

  @ViewChild('canvas') private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationFrameId: number | null = null;
  private stopTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.play) this.launch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['play']?.currentValue && this.viewReady) {
      this.launch();
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  private launch(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: ConfettiPiece[] = Array.from({ length: PIECE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360,
      vx: (Math.random() - 0.5) * 3,
      vy: 2.5 + Math.random() * 4,
      vr: (Math.random() - 0.5) * 6,
    }));

    let done = false;
    const draw = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.y < canvas.height ? 1 : Math.max(0, 1 - (p.y - canvas.height) / 80);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (!done) this.animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    this.stopTimeoutId = setTimeout(() => {
      done = true;
      this.stopAnimation();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, DURATION_MS);
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stopTimeoutId !== null) {
      clearTimeout(this.stopTimeoutId);
      this.stopTimeoutId = null;
    }
  }
}
