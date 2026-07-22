export interface Player {
  id: number;
  name: string;
  colorClass: string;
  score: number;
}

export interface RankedPlayer extends Player {
  rank: number;
  tied: boolean;
}
