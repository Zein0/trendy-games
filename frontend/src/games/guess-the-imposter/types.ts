import type { Room as BaseRoom } from '../../shared/types';

export interface GuessTheImposterGame {
  type: 'guess-the-imposter';
  category: 'actors' | 'movies' | 'football-athletes' | 'animals' | 'football-clubs';
  numImposters: number;
  mainWord: string;
  words: { [playerId: string]: string };
  clues: { [playerId: string]: string[] };
  votes: { [playerId: string]: string[] };
  results?: GuessTheImposterResults;
  currentTurnPlayerId?: string;
  turnOrder?: string[];
  clueSubmissionOrder?: string[];
  continueVotes?: { [playerId: string]: boolean };
  readyToVoteCount?: number;
}

export interface GuessTheImposterResults {
  imposters: string[];
  correctVotes: string[];
  winners: 'imposters' | 'citizens';
}

export interface GuessTheImposterGameConfig {
  category: GuessTheImposterGame['category'];
  numImposters: number;
}

export type GuessTheImposterRoom = BaseRoom<GuessTheImposterGame>;

// Note: Legacy exports are handled in the main types.ts file to avoid conflicts