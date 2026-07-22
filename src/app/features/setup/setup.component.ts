import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DEFAULT_ROUNDS,
  DEFAULT_TIMER,
  MAX_PLAYERS,
  MIN_PLAYERS,
  ROUND_OPTIONS,
  TIMER_OPTIONS,
} from '../../core/constants/game.constants';
import { GameStateService } from '../../core/services/game-state.service';
import { WordsService } from '../../core/services/words.service';
import { PlayerSlotComponent } from './player-slot/player-slot.component';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PlayerSlotComponent],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly gameState = inject(GameStateService);
  private readonly wordsService = inject(WordsService);
  private readonly router = inject(Router);

  readonly timerOptions = TIMER_OPTIONS;
  readonly roundOptions = ROUND_OPTIONS;
  readonly maxPlayers = MAX_PLAYERS;
  readonly minPlayers = MIN_PLAYERS;

  readonly errorMessage = signal('');
  readonly selectedTimer = signal(DEFAULT_TIMER);
  readonly selectedRounds = signal(DEFAULT_ROUNDS);
  readonly startingGame = signal(false);

  readonly players: FormArray<FormControl<string>> = this.fb.array([this.fb.control('Jogador 1')]);

  get playerControls(): FormControl<string>[] {
    return this.players.controls;
  }

  addPlayer(): void {
    if (this.players.length >= this.maxPlayers) return;
    this.players.push(this.fb.control(''));
  }

  removePlayer(index: number): void {
    if (this.players.length <= this.minPlayers) {
      this.errorMessage.set(`Mínimo ${this.minPlayers} jogadores.`);
      return;
    }
    this.players.removeAt(index);
    this.errorMessage.set('');
  }

  selectTimer(seconds: number): void {
    this.selectedTimer.set(seconds);
  }

  selectRounds(rounds: number): void {
    this.selectedRounds.set(rounds);
  }

  async startGame(): Promise<void> {
    this.errorMessage.set('');

    if (this.players.length < this.minPlayers) {
      this.errorMessage.set(`Adicione pelo menos ${this.minPlayers} jogadores.`);
      return;
    }

    const names = this.players.controls.map((control, i) => control.value.trim() || `Jogador ${i + 1}`);
    const rounds = this.selectedRounds();

    this.startingGame.set(true);
    // Sorteia e busca no Firestore exatamente as palavras necessárias para a partida (uma por
    // rodada); se a fonte for local, este método não faz nada. Feito isso, nenhuma outra
    // requisição ao banco ocorre durante o jogo.
    await this.wordsService.loadWordsForRounds(rounds);
    this.startingGame.set(false);

    this.gameState.configurePlayers(names, this.selectedTimer(), rounds);
    this.router.navigate(['/transicao'], { queryParams: { first: '1' } });
  }
}
