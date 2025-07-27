// Legacy types file - imports from new structure for backward compatibility
export * from '../shared/types';

// Re-export game-specific types with explicit naming to resolve conflicts
export type {
  GuessTheImposterGame as Game,
  GuessTheImposterResults as GameResults,
  GuessTheImposterRoom as Room,
  GuessTheImposterGameConfig
} from '../games/guess-the-imposter/types';