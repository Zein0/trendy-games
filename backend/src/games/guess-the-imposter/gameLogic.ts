import { v4 as uuidv4 } from 'uuid';
import { Player } from '../../shared/types';
import { GuessTheImposterRoom, GuessTheImposterGame, GuessTheImposterResults, GuessTheImposterGameConfig } from './types';
import { getRandomWord, getRandomWords, WORD_LISTS } from './wordLists';

export class GuessTheImposterGameManager {
  createGame(
    room: GuessTheImposterRoom, 
    hostId: string, 
    gameConfig: GuessTheImposterGameConfig
  ): GuessTheImposterGame | null {
    if (room.hostId !== hostId || room.players.length < 2) return null;

    const { category, numImposters } = gameConfig;
    
    if (numImposters >= room.players.length) return null;
    
    const availableWords = WORD_LISTS[category];
    if (availableWords.length <= numImposters) return null;

    const playerIds = room.players.map(p => p.id);
    const imposterIds = this.selectRandomImposters(playerIds, numImposters);
    
    const mainWord = getRandomWord(category);
    const imposterWords = getRandomWords(category, numImposters, mainWord);
    
    const words: { [playerId: string]: string } = {};
    let imposterIndex = 0;
    
    playerIds.forEach(playerId => {
      if (imposterIds.includes(playerId)) {
        words[playerId] = imposterWords[imposterIndex];
        imposterIndex++;
      } else {
        words[playerId] = mainWord;
      }
    });

    const shuffledPlayerIds = [...playerIds].sort(() => Math.random() - 0.5);
    
    const game: GuessTheImposterGame = {
      type: 'guess-the-imposter',
      category,
      numImposters,
      mainWord,
      words,
      clues: {},
      votes: {},
      currentTurnPlayerId: shuffledPlayerIds[0],
      turnOrder: shuffledPlayerIds,
      clueSubmissionOrder: [],
      continueVotes: {},
      readyToVoteCount: 0
    };

    return game;
  }

  private selectRandomImposters(playerIds: string[], count: number): string[] {
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private advanceTurn(game: GuessTheImposterGame): void {
    const currentIndex = game.turnOrder.indexOf(game.currentTurnPlayerId || '');
    const nextIndex = (currentIndex + 1) % game.turnOrder.length;
    game.currentTurnPlayerId = game.turnOrder[nextIndex];
  }

  getCurrentTurnPlayer(game: GuessTheImposterGame): string | null {
    return game.currentTurnPlayerId || null;
  }

  hasAllPlayersSubmittedClues(game: GuessTheImposterGame): boolean {
    return game.turnOrder.every(playerId => playerId in game.clues && game.clues[playerId].length > 0);
  }

  submitClue(game: GuessTheImposterGame, playerId: string, clue: string): boolean {
    // Only allow current turn player to submit clues
    if (game.currentTurnPlayerId !== playerId) return false;

    // Initialize clues array if it doesn't exist
    if (!(playerId in game.clues)) {
      game.clues[playerId] = [];
    }

    // Add the new clue to the player's clue array
    game.clues[playerId].push(clue);
    
    // Add to submission order if this is their first clue
    if (!game.clueSubmissionOrder.includes(playerId)) {
      game.clueSubmissionOrder.push(playerId);
    }
    
    // Advance to next player's turn
    this.advanceTurn(game);
    
    return true;
  }

  setPlayerReady(game: GuessTheImposterGame, playerId: string, players: Player[]): boolean {
    const player = players.find(p => p.id === playerId);
    if (!player || player.isReady) return false;

    player.isReady = true;
    game.readyToVoteCount++;
    return true;
  }

  canStartVoting(game: GuessTheImposterGame, playerCount: number): boolean {
    return game.readyToVoteCount > playerCount / 2;
  }

  startVoting(game: GuessTheImposterGame, players: Player[]): boolean {
    players.forEach(p => p.isReady = false);
    game.readyToVoteCount = 0;
    
    // Initialize votes as arrays for multiple votes per player
    Object.keys(game.words).forEach(playerId => {
      game.votes[playerId] = [];
    });
    
    return true;
  }

  submitVote(game: GuessTheImposterGame, playerId: string, votedForId: string, players: Player[]): boolean {
    if (!players.find(p => p.id === votedForId)) return false;

    // Check how many votes this player can cast
    const isImposter = this.isPlayerImposter(playerId, game);
    const maxVotes = isImposter ? game.numImposters : 1;
    
    if (game.votes[playerId].length >= maxVotes) return false;
    
    // Prevent voting for the same player twice
    if (game.votes[playerId].includes(votedForId)) return false;

    game.votes[playerId].push(votedForId);
    return true;
  }

  removeVote(game: GuessTheImposterGame, playerId: string, votedForId: string): boolean {
    const voteIndex = game.votes[playerId].indexOf(votedForId);
    if (voteIndex === -1) return false;

    game.votes[playerId].splice(voteIndex, 1);
    return true;
  }

  canEndGame(game: GuessTheImposterGame): boolean {
    // Check if all players have cast their maximum number of votes
    return Object.keys(game.votes).every(playerId => {
      const isImposter = this.isPlayerImposter(playerId, game);
      const maxVotes = isImposter ? game.numImposters : 1;
      return game.votes[playerId].length >= maxVotes;
    });
  }

  endGame(game: GuessTheImposterGame): GuessTheImposterResults | null {
    if (!this.canEndGame(game)) return null;

    const votes = game.votes;
    
    const voteCounts: { [playerId: string]: number } = {};
    Object.values(votes).forEach(playerVotes => {
      playerVotes.forEach(votedForId => {
        voteCounts[votedForId] = (voteCounts[votedForId] || 0) + 1;
      });
    });

    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVotedPlayers = Object.keys(voteCounts).filter(
      playerId => voteCounts[playerId] === maxVotes
    );

    const actualImposters = Object.keys(game.words).filter(playerId => {
      const playerWord = game.words[playerId];
      return playerWord !== game.mainWord;
    });

    const correctVotes = mostVotedPlayers.filter(playerId => 
      actualImposters.includes(playerId)
    );

    const winners = correctVotes.length > 0 ? 'citizens' : 'imposters';

    const results: GuessTheImposterResults = {
      imposters: actualImposters,
      correctVotes,
      winners
    };

    game.results = results;
    return results;
  }

  submitContinueVote(game: GuessTheImposterGame, playerId: string, continueGame: boolean): boolean {
    game.continueVotes[playerId] = continueGame;
    return true;
  }

  hasAllPlayersContinueVoted(game: GuessTheImposterGame, playerCount: number): boolean {
    const continueVoteCount = Object.keys(game.continueVotes).length;
    return continueVoteCount === playerCount;
  }

  shouldContinueGame(game: GuessTheImposterGame, playerCount: number): boolean {
    const continueVotes = Object.values(game.continueVotes);
    const continueCount = continueVotes.filter(vote => vote === true).length;
    
    return continueCount > playerCount / 2;
  }

  resetForResubmission(game: GuessTheImposterGame): boolean {
    game.clues = {};
    game.clueSubmissionOrder = [];
    game.continueVotes = {};
    game.currentTurnPlayerId = game.turnOrder[0];
    game.readyToVoteCount = 0;
    return true;
  }

  isPlayerImposter(playerId: string, game: GuessTheImposterGame): boolean {
    const playerWord = game.words[playerId];
    return playerWord !== game.mainWord;
  }

  restartGame(room: GuessTheImposterRoom, hostId: string): GuessTheImposterGame | null {
    if (room.hostId !== hostId || !room.currentGame) return null;

    const previousGame = room.currentGame;
    const gameConfig = {
      category: previousGame.category,
      numImposters: previousGame.numImposters
    };

    return this.createGame(room, hostId, gameConfig);
  }
}