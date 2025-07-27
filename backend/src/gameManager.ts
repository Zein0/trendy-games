import { RoomManager } from './shared/roomManager';
import { Room, Player } from './shared/types';
import { GuessTheImposterGameManager } from './games/guess-the-imposter/gameLogic';
import { GuessTheImposterRoom, GuessTheImposterGame, GuessTheImposterResults, GuessTheImposterGameConfig } from './games/guess-the-imposter/types';

export class GameManager {
  private roomManager = new RoomManager();
  private guessTheImposterManager = new GuessTheImposterGameManager();

  // Room management methods
  generateRoomCode(): string {
    return this.roomManager.generateRoomCode();
  }

  createRoom(hostId: string, hostName: string): Room {
    return this.roomManager.createRoom(hostId, hostName);
  }

  joinRoom(roomCode: string, playerId: string, playerName: string): Room | null {
    return this.roomManager.joinRoom(roomCode, playerId, playerName);
  }

  leaveRoom(playerId: string): { room: Room | null; hostChanged: boolean; newHost?: Player } {
    return this.roomManager.leaveRoom(playerId);
  }

  getRoom(roomCode: string): Room | null {
    return this.roomManager.getRoom(roomCode);
  }

  getRoomByPlayerId(playerId: string): Room | null {
    return this.roomManager.getRoomByPlayerId(playerId);
  }

  resetRoom(roomCode: string): boolean {
    return this.roomManager.resetRoom(roomCode);
  }

  // Game-specific methods for guess-the-imposter
  startGame(roomCode: string, hostId: string, gameConfig: GuessTheImposterGameConfig): GuessTheImposterGame | null {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room) return null;

    const game = this.guessTheImposterManager.createGame(room, hostId, gameConfig);
    if (!game) return null;

    room.currentGame = game;
    room.gameState = 'in-game';
    room.players.forEach(p => p.isReady = false);

    return game;
  }

  getCurrentTurnPlayer(roomCode: string): string | null {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame) return null;
    return this.guessTheImposterManager.getCurrentTurnPlayer(room.currentGame);
  }

  hasAllPlayersSubmittedClues(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame) return false;
    return this.guessTheImposterManager.hasAllPlayersSubmittedClues(room.currentGame);
  }

  submitClue(playerId: string, clue: string): boolean {
    const room = this.getRoomByPlayerId(playerId) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'in-game') return false;

    return this.guessTheImposterManager.submitClue(room.currentGame, playerId, clue);
  }

  setPlayerReady(playerId: string): boolean {
    const room = this.getRoomByPlayerId(playerId) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'in-game') return false;

    return this.guessTheImposterManager.setPlayerReady(room.currentGame, playerId, room.players);
  }

  canStartVoting(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'in-game') return false;

    return this.guessTheImposterManager.canStartVoting(room.currentGame, room.players.length);
  }

  startVoting(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame || !this.canStartVoting(roomCode)) return false;

    room.gameState = 'voting';
    return this.guessTheImposterManager.startVoting(room.currentGame, room.players);
  }

  submitVote(playerId: string, votedForId: string): boolean {
    const room = this.getRoomByPlayerId(playerId) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'voting') return false;

    return this.guessTheImposterManager.submitVote(room.currentGame, playerId, votedForId, room.players);
  }

  removeVote(playerId: string, votedForId: string): boolean {
    const room = this.getRoomByPlayerId(playerId) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'voting') return false;

    return this.guessTheImposterManager.removeVote(room.currentGame, playerId, votedForId);
  }

  canEndGame(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'voting') return false;

    return this.guessTheImposterManager.canEndGame(room.currentGame);
  }

  endGame(roomCode: string): GuessTheImposterResults | null {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame || !this.canEndGame(roomCode)) return null;

    const results = this.guessTheImposterManager.endGame(room.currentGame);
    if (results) {
      room.gameState = 'results';
    }
    return results;
  }

  restartGame(roomCode: string, hostId: string): GuessTheImposterGame | null {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room) return null;

    const game = this.guessTheImposterManager.restartGame(room, hostId);
    if (game) {
      room.currentGame = game;
      room.gameState = 'in-game';
      room.players.forEach(p => p.isReady = false);
    }
    return game;
  }

  startContinueOrVotePhase(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'in-game') return false;

    if (!this.hasAllPlayersSubmittedClues(roomCode)) return false;

    room.gameState = 'continue-or-vote';
    room.players.forEach(p => p.isReady = false);
    room.currentGame.continueVotes = {};
    
    return true;
  }

  submitContinueVote(playerId: string, continueGame: boolean): boolean {
    const room = this.getRoomByPlayerId(playerId) as GuessTheImposterRoom;
    if (!room || !room.currentGame || room.gameState !== 'continue-or-vote') return false;

    return this.guessTheImposterManager.submitContinueVote(room.currentGame, playerId, continueGame);
  }

  hasAllPlayersContinueVoted(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame) return false;

    return this.guessTheImposterManager.hasAllPlayersContinueVoted(room.currentGame, room.players.length);
  }

  shouldContinueGame(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame) return false;

    return this.guessTheImposterManager.shouldContinueGame(room.currentGame, room.players.length);
  }

  resetForResubmission(roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame) return false;

    room.gameState = 'in-game';
    room.players.forEach(p => p.isReady = false);
    return this.guessTheImposterManager.resetForResubmission(room.currentGame);
  }

  isPlayerImposter(playerId: string, roomCode: string): boolean {
    const room = this.getRoom(roomCode) as GuessTheImposterRoom;
    if (!room || !room.currentGame) return false;

    return this.guessTheImposterManager.isPlayerImposter(playerId, room.currentGame);
  }

  handlePlayerLeaving(playerId: string): { shouldEndGame: boolean; room: Room | null; hostChanged: boolean; newHost?: Player } {
    const room = this.getRoomByPlayerId(playerId) as GuessTheImposterRoom;
    if (!room || !room.currentGame) {
      const { room: leftRoom, hostChanged, newHost } = this.leaveRoom(playerId);
      return { shouldEndGame: false, room: leftRoom, hostChanged, newHost };
    }

    const isImposter = this.isPlayerImposter(playerId, room.code);
    const { room: leftRoom, hostChanged, newHost } = this.leaveRoom(playerId);
    
    if (isImposter && leftRoom && leftRoom.currentGame) {
      leftRoom.gameState = 'results';
      const actualImposters = Object.keys(leftRoom.currentGame.words).filter(pId => {
        const playerWord = leftRoom.currentGame!.words[pId];
        return playerWord !== leftRoom.currentGame!.mainWord;
      });

      leftRoom.currentGame.results = {
        imposters: actualImposters,
        correctVotes: [],
        winners: 'citizens'
      };
      return { shouldEndGame: true, room: leftRoom, hostChanged, newHost };
    }

    return { shouldEndGame: false, room: leftRoom, hostChanged, newHost };
  }
}