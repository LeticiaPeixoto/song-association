export type LogOutcome = 'ok' | 'skip' | 'out';

export interface LogEntry {
  id: number;
  word: string;
  outcome: LogOutcome;
  label: string;
  timeLeft: number;
}

export interface GameStats {
  points: number;
  passes: number;
  errors: number;
}
