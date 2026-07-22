import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { TimerService } from '../../core/services/timer.service';
import { WordsService } from '../../core/services/words.service';
import { AudioService } from '../../core/services/audio.service';
import { EndGameModalComponent } from './components/end-game-modal/end-game-modal.component';
import { GameActionsComponent } from './components/game-actions/game-actions.component';
import { PlayerScoreButtonsComponent } from './components/player-score-buttons/player-score-buttons.component';
import { RoundTimerComponent } from './components/round-timer/round-timer.component';
import { WordCardComponent } from './components/word-card/word-card.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    PlayerScoreButtonsComponent,
    RoundTimerComponent,
    WordCardComponent,
    GameActionsComponent,
    EndGameModalComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit, OnDestroy {
  private readonly gameState = inject(GameStateService);
  private readonly timerService = inject(TimerService);
  private readonly wordsService = inject(WordsService);
  private readonly audioService = inject(AudioService);
  private readonly router = inject(Router);

  readonly players = this.gameState.players;
  readonly scoredPlayerIds = this.gameState.scoredPlayerIds;
  readonly round = this.gameState.round;
  readonly totalRounds = this.gameState.totalRounds;
  readonly currentWord = this.gameState.currentWord;
  readonly unseenLogCount = this.gameState.unseenLogCount;
  readonly wordSource = this.wordsService.source;

  readonly timeLeft = this.timerService.timeLeft;
  readonly total = this.timerService.total;
  readonly running = this.timerService.running;
  readonly paused = this.timerService.paused;
  readonly isMuted = this.audioService.isMuted;

  readonly endGameModalOpen = signal(false);
  readonly flashColor = signal<'' | 'green' | 'red'>('');
  private endTurnTimeoutId?: any;

  toggleMute(): void {
    this.audioService.toggleMute();
  }

  ngOnInit(): void {
    this.timerService.setTotal(this.gameState.timerDuration());
    this.timerService.reset();
    this.startRound();
  }

  ngOnDestroy(): void {
    this.timerService.reset();
    if (this.endTurnTimeoutId) {
      clearTimeout(this.endTurnTimeoutId);
    }
  }

  pass(): void {
    this.gameState.registerPass(this.timeLeft());
    this.flash('red');
    this.endTurn();
  }

  /** Alterna a pontuação do jogador clicado; mais de um jogador pode pontuar na mesma rodada. */
  toggleScore(playerId: number): void {
    this.gameState.toggleScore(playerId);
    this.flash('green');
  }

  openEndGameModal(): void {
    this.timerService.stop();
    this.endGameModalOpen.set(true);
  }

  closeEndGameModal(): void {
    this.endGameModalOpen.set(false);
    this.timerService.resume();
  }

  confirmEndGame(): void {
    this.endGameModalOpen.set(false);
    this.finishGame();
  }

  /** Sorteia a palavra e inicia o temporizador automaticamente ao entrar na tela do jogo. */
  private startRound(): void {
    this.gameState.drawWord();
    this.timerService.start(() => this.handleTimeout());
    this.flash('green');
  }

  private handleTimeout(): void {
    this.gameState.registerTimeout();
    this.flash('red');
    this.endTurn();
  }

  private flash(color: 'green' | 'red'): void {
    this.flashColor.set(color);
    setTimeout(() => this.flashColor.set(''), 400);
  }

  /**
   * Finaliza a rodada atual. Enquanto não for a última rodada, avança direto para a próxima
   * palavra (sem passar pela tela de transição). Ao concluir a última rodada, encerra a
   * partida reaproveitando a mesma lógica do botão "Encerrar".
   */
  private endTurn(): void {
    const wasLastRound = this.gameState.isLastRound();
    this.gameState.advanceTurn();

    if (wasLastRound) {
      this.finishGame();
    } else {
      this.timerService.reset();
      this.endTurnTimeoutId = setTimeout(() => this.startRound(), 2000);
    }
  }

  /** Lógica única de encerramento de partida, usada tanto pelo botão "Encerrar" quanto ao fim da última rodada. */
  private finishGame(): void {
    this.timerService.reset();
    this.router.navigate(['/ranking']);
  }
}
