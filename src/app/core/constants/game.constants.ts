import { GameWord } from '../models/word.model';

export const COLOR_CLASSES = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const;

export const DEFAULT_NAMES = ['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4', 'Jogador 5', 'Jogador 6'];

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 6;

export const TIMER_OPTIONS = [5, 10, 15, 20];
export const DEFAULT_TIMER = 10;

export const ROUND_OPTIONS = [5, 10, 15, 20];
export const DEFAULT_ROUNDS = 5;

export const MEDALS = ['🥇', '🥈', '🥉'];

export const FALLBACK_WORDS: GameWord[] = [
  { word: 'Anjo', wordEn: 'Angel' },
  { word: 'Mundo', wordEn: 'World' },
  { word: 'Você', wordEn: 'You' },
  { word: 'Eu', wordEn: 'Me' },
  { word: 'Minha', wordEn: 'Mine' },
  { word: 'Segunda-feira', wordEn: 'Monday' },
  { word: 'Gin', wordEn: 'Gin' },
  { word: 'Tigrinho', wordEn: 'Little Tiger' },
  { word: 'Pai', wordEn: 'Father' },
  { word: 'Rua', wordEn: 'Street' },
  { word: 'Mãe', wordEn: 'Mother' },
  { word: 'Vermelho', wordEn: 'Red' },
  { word: 'Garçom', wordEn: 'Waiter' },
  { word: 'Água', wordEn: 'Water' },
  { word: 'Carro', wordEn: 'Car' },
  { word: 'Chuva', wordEn: 'Rain' },
  { word: 'Chovendo', wordEn: 'Raining' },
  { word: 'Baile', wordEn: 'Dance' },
  { word: 'Tudo', wordEn: 'Everything' },
  { word: 'Flor', wordEn: 'Flower' },
  { word: 'Carnaval', wordEn: 'Carnival' },
  { word: 'Coração', wordEn: 'Heart' },
  { word: 'Bola', wordEn: 'Ball' },
  { word: 'Favela', wordEn: 'Favela' },
  { word: 'Cobertor', wordEn: 'Blanket' },
  { word: 'Noite', wordEn: 'Night' },
  { word: 'Escola', wordEn: 'School' },
  { word: 'Samurai', wordEn: 'Samurai' },
  { word: 'Caju', wordEn: 'Cashew' },
  { word: 'Azul', wordEn: 'Blue' },
  { word: 'Versos', wordEn: 'Verses' },
  { word: 'Lua', wordEn: 'Moon' },
  { word: 'Paz', wordEn: 'Peace' },
  { word: 'Mente', wordEn: 'Mind' },
  { word: 'Fé', wordEn: 'Faith' },
  { word: 'Piercing', wordEn: 'Piercing' },
  { word: 'Taxi', wordEn: 'Taxi' },
  { word: 'Namorado', wordEn: 'Boyfriend' },
  { word: 'Namorada', wordEn: 'Girlfriend' },
  { word: 'Morena', wordEn: 'Brunette' },
  { word: 'Bunda', wordEn: 'Butt' },
  { word: 'Boa', wordEn: 'Good' },
  { word: 'Bem', wordEn: 'Well' },
  { word: 'Amarelo', wordEn: 'Yellow' },
  { word: 'Batom', wordEn: 'Lipstick' },
  { word: 'Mar', wordEn: 'Sea' },
  { word: 'Quarto', wordEn: 'Room' },
  { word: 'Veneno', wordEn: 'Poison' },
  { word: 'Jurei', wordEn: 'Swore' },
  { word: 'Segundos', wordEn: 'Seconds' },
  { word: 'Lixo', wordEn: 'Trash' },
  { word: 'Dinheiro', wordEn: 'Money' },
  { word: 'Deus', wordEn: 'God' },
  { word: 'Verdade', wordEn: 'Truth' },
  { word: 'Caso', wordEn: 'Case' },
  { word: 'Quitanda', wordEn: 'Greengrocery' },
  { word: 'Ali Babá', wordEn: 'Ali Baba' }
];
