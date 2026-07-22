import { Injectable, computed, signal } from '@angular/core';
import { COLOR_CLASSES, DEFAULT_ROUNDS, DEFAULT_TIMER } from '../constants/game.constants';
import { GameStats, LogEntry, LogOutcome } from '../models/log-entry.model';
import { Player, RankedPlayer } from '../models/player.model';
import { GameWord } from '../models/word.model';
import { WordsService } from './words.service';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly _players = signal<Player[]>([]);
  private readonly _round = signal(1);
  private readonly _timerDuration = signal(DEFAULT_TIMER);
  private readonly _totalRounds = signal(DEFAULT_ROUNDS);
  private readonly _currentWord = signal<GameWord | null>(null);
  private readonly _log = signal<LogEntry[]>([]);
  private readonly _stats = signal<GameStats>({ points: 0, passes: 0, errors: 0 });
  private readonly _unseenLogCount = signal(0);
  private readonly _scoredPlayerIds = signal<ReadonlySet<number>>(new Set());

  private usedWords = new Set<string>();
  private nextLogId = 1;

  readonly players = this._players.asReadonly();
  readonly round = this._round.asReadonly();
  readonly timerDuration = this._timerDuration.asReadonly();
  readonly totalRounds = this._totalRounds.asReadonly();
  readonly currentWord = this._currentWord.asReadonly();
  readonly log = this._log.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly unseenLogCount = this._unseenLogCount.asReadonly();
  /** Ids dos jogadores que já pontuaram na rodada/palavra atual (permite alternar/desfazer). */
  readonly scoredPlayerIds = this._scoredPlayerIds.asReadonly();

  /** True quando a rodada atual é a última da partida configurada. */
  readonly isLastRound = computed(() => this._round() >= this._totalRounds());

  readonly rankedPlayers = computed<RankedPlayer[]>(() => {
    const sorted = [...this._players()].sort((a, b) => b.score - a.score);
    let displayRank = 1;
    return sorted.map((player, index) => {
      const tied = index > 0 && player.score === sorted[index - 1].score;
      if (!tied) displayRank = index + 1;
      return { ...player, rank: displayRank, tied } as RankedPlayer;
    });
  });

  constructor(private readonly wordsService: WordsService) {}

  /** Cria os jogadores a partir dos nomes informados no setup e define o tempo por rodada e o total de rodadas. */
  configurePlayers(names: string[], timerDuration: number, totalRounds: number): void {
    this._players.set(
      names.map((name, index) => ({
        id: index,
        name,
        colorClass: COLOR_CLASSES[index],
        score: 0,
      })),
    );
    this._timerDuration.set(timerDuration);
    this._totalRounds.set(totalRounds);
    this.resetProgress();
  }

  /** Zera pontuação, mantendo os mesmos jogadores (usado em "Jogar de novo"). */
  restartWithSamePlayers(): void {
    this._players.update((players) => players.map((p) => ({ ...p, score: 0 })));
    this.resetProgress();
  }

  /** Remove todos os jogadores, voltando ao estado inicial (usado em "Nova partida"). */
  resetPlayers(): void {
    this._players.set([]);
    this.resetProgress();
  }

  private resetProgress(): void {
    this._round.set(1);
    this._currentWord.set(null);
    this._log.set([]);
    this._stats.set({ points: 0, passes: 0, errors: 0 });
    this._unseenLogCount.set(0);
    this._scoredPlayerIds.set(new Set());
    this.usedWords.clear();
    this.nextLogId = 1;
  }

  /** Sorteia uma nova palavra ainda não usada nesta partida. */
  drawWord(): GameWord {
    const allWords = this.wordsService.words();
    let available = allWords.filter((w) => !this.usedWords.has(w.word));
    if (available.length === 0) {
      this.usedWords.clear();
      available = [...allWords];
    }
    const picked = available[Math.floor(Math.random() * available.length)];
    this.usedWords.add(picked.word);
    this._currentWord.set(picked);
    this._scoredPlayerIds.set(new Set());
    return picked;
  }

  /**
   * Alterna a pontuação de um jogador na rodada/palavra atual.
   * Se o jogador ainda não pontuou, soma 1 ponto. Se já tiver pontuado, remove o ponto.
   * Mais de um jogador pode pontuar na mesma rodada.
   */
  toggleScore(playerId: number): void {
    const word = this._currentWord();
    const player = this._players().find((p) => p.id === playerId);
    if (!word || !player) return;

    const alreadyScored = this._scoredPlayerIds().has(playerId);
    const delta = alreadyScored ? -1 : 1;

    this._players.update((players) =>
      players.map((p) => (p.id === playerId ? { ...p, score: Math.max(0, p.score + delta) } : p)),
    );
    this._stats.update((s) => ({ ...s, points: Math.max(0, s.points + delta) }));

    this._scoredPlayerIds.update((ids) => {
      const next = new Set(ids);
      if (alreadyScored) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  /** Registra que a palavra foi passada, resumindo quem pontuou nessa rodada (se alguém pontuou). */
  registerPass(timeLeft: number): void {
    const word = this._currentWord();
    if (!word) return;
    const scorers = this.scorerNames();
    if (scorers.length > 0) {
      this.pushLog(word.word, 'ok', `Pontuaram: ${scorers.join(', ')}`, timeLeft);
      return;
    }
    this._stats.update((s) => ({ ...s, passes: s.passes + 1 }));
    this.pushLog(word.word, 'skip', 'Palavra passada', timeLeft);
  }

  /** Registra que o tempo esgotou, resumindo quem pontuou nessa rodada (se alguém pontuou). */
  registerTimeout(): void {
    const word = this._currentWord();
    if (!word) return;
    const scorers = this.scorerNames();
    if (scorers.length > 0) {
      this.pushLog(word.word, 'ok', `Tempo esgotado — Pontuaram: ${scorers.join(', ')}`, 0);
      return;
    }
    this._stats.update((s) => ({ ...s, errors: s.errors + 1 }));
    this.pushLog(word.word, 'out', 'Tempo esgotado', 0);
  }

  /** Avança para a próxima rodada. */
  advanceTurn(): void {
    this._round.update((r) => r + 1);
  }

  private scorerNames(): string[] {
    const ids = this._scoredPlayerIds();
    return this._players()
      .filter((p) => ids.has(p.id))
      .map((p) => p.name);
  }

  /** Marca o histórico como visualizado (badge de notificação). */
  markLogSeen(): void {
    this._unseenLogCount.set(0);
  }

  private pushLog(word: string, outcome: LogOutcome, label: string, timeLeft: number): void {
    const entry: LogEntry = { id: this.nextLogId++, word, outcome, label, timeLeft };
    this._log.update((entries) => [entry, ...entries]);
    this._unseenLogCount.update((n) => n + 1);
  }
}
