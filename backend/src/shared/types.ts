export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

export interface Room<T = any> {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  currentGame?: T;
}

export type GameState = 'waiting' | 'game-selection' | 'in-game' | 'voting' | 'results' | 'continue-or-vote';

export interface ServerToClientEvents {
  'room-joined': (room: Room) => void;
  'room-updated': (room: Room) => void;
  'game-started': (game: any) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'clue-submitted': (playerId: string, clue: string, allClues: string[]) => void;
  'turn-changed': (currentTurnPlayerId: string) => void;
  'voting-started': () => void;
  'vote-submitted': (playerId: string, votedFor: string) => void;
  'game-ended': (results: any) => void;
  'continue-or-vote-prompt': () => void;
  'resubmission-phase': () => void;
  'game-restarted': (game: any) => void;
  'returned-to-lobby': () => void;
  'host-changed': (newHostId: string, newHostName: string) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'create-room': (playerName: string) => void;
  'join-room': (roomCode: string, playerName: string) => void;
  'leave-room': () => void;
  'start-game': (gameConfig: any) => void;
  'submit-clue': (clue: string) => void;
  'ready-to-vote': () => void;
  'submit-vote': (playerId: string) => void;
  'remove-vote': (playerId: string) => void;
  'vote-continue': (continueGame: boolean) => void;
  'restart-game': () => void;
  'return-to-lobby': () => void;
}