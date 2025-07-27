import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Users, Clock, Eye, Vote, Trophy, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { Room } from '../types';

interface GamePlayProps {
  room: Room;
  currentPlayerId: string;
  onSubmitClue: (clue: string) => void;
  onReadyToVote: () => void;
  onSubmitVote: (playerId: string) => void;
  onRemoveVote: (playerId: string) => void;
  onVoteContinue: (continueGame: boolean) => void;
  onRestartGame: () => void;
  onReturnToLobby: () => void;
}

export function GamePlay({ room, currentPlayerId, onSubmitClue, onReadyToVote, onSubmitVote, onRemoveVote, onVoteContinue, onRestartGame, onReturnToLobby }: GamePlayProps) {
  const [clue, setClue] = useState('');
  const [selectedVote, setSelectedVote] = useState<string>('');
  const [cluesExpanded, setCluesExpanded] = useState(true);
  const [playersExpanded, setPlayersExpanded] = useState(false);

  const currentPlayer = room.players.find(p => p.id === currentPlayerId);
  const currentGame = room.currentGame;

  if (!currentGame || !currentPlayer) {
    return (
      <div className="text-center">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl mb-4">Game Error</h2>
            <p>Unable to load game data. Please refresh the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const playerWord = currentGame.words[currentPlayerId];
  const hasSubmittedClue = currentPlayerId in currentGame.clues && currentGame.clues[currentPlayerId].length > 0;
  const playerVotes = currentGame.votes[currentPlayerId] || [];
  const readyPlayersCount = room.players.filter(p => p.isReady).length;
  const isCurrentPlayerTurn = currentGame.currentTurnPlayerId === currentPlayerId;
  const isPlayerImposter = playerWord !== currentGame.mainWord;
  const maxVotes = isPlayerImposter ? currentGame.numImposters : 1;

  const handleSubmitClue = () => {
    if (clue.trim()) {
      onSubmitClue(clue.trim());
      setClue('');
    }
  };

  const handleReadyToVote = () => {
    onReadyToVote();
  };

  const handleSubmitVote = () => {
    if (selectedVote && !playerVotes.includes(selectedVote)) {
      onSubmitVote(selectedVote);
      setSelectedVote('');
    }
  };

  const handleRemoveVote = (playerId: string) => {
    onRemoveVote(playerId);
  };

  const renderInGamePhase = () => (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Guess the Imposter</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Category: <span className="font-medium capitalize">{currentGame.category.replace('-', ' ')}</span>
        </p>
      </div>

      <Card className="border-primary">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Eye className="h-5 w-5" />
            Your Word
          </CardTitle>
          <CardDescription>
            Give a clue about this word without saying it directly
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center p-4">
          <div className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6 p-3 md:p-4 bg-primary/10 rounded-lg">
            {playerWord}
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {hasSubmittedClue && (
              <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm">
                ✓ Clues submitted: {currentGame.clues[currentPlayerId]?.length || 0}
              </div>
            )}
            
            <Input
              placeholder={isCurrentPlayerTurn ? "Enter your clue..." : "Wait for your turn..."}
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && clue.trim() && isCurrentPlayerTurn) {
                  handleSubmitClue();
                }
              }}
              className="text-center text-sm md:text-base"
              disabled={!isCurrentPlayerTurn}
            />
            <Button 
              onClick={handleSubmitClue}
              disabled={!clue.trim() || !isCurrentPlayerTurn}
              className="w-full md:w-auto min-w-[120px] text-sm md:text-base"
            >
              Submit Clue
            </Button>
            
            {!isCurrentPlayerTurn && (
              <div className="text-center">
                <Badge variant="outline" className="text-xs md:text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentGame.currentTurnPlayerId ? 
                    `${room.players.find(p => p.id === currentGame.currentTurnPlayerId)?.name}'s turn` : 
                    'Waiting for turn...'
                  }
                </Badge>
              </div>
            )}
            
            {!currentPlayer.isReady && (
              <Button 
                onClick={handleReadyToVote}
                variant="secondary"
                className="w-full md:w-auto text-sm md:text-base"
              >
                <Vote className="h-4 w-4 mr-2" />
                I'm Ready to Vote
              </Button>
            )}
            
            {currentPlayer.isReady && (
              <Badge variant="secondary" className="text-xs md:text-sm">
                <Clock className="h-3 w-3 mr-1" />
                Waiting for others to be ready...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submitted Clues Section */}
      {(currentGame.clueSubmissionOrder || []).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle 
              className="flex items-center justify-between cursor-pointer text-base md:text-lg"
              onClick={() => setCluesExpanded(!cluesExpanded)}
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 md:h-5 md:w-5" />
                Submitted Clues ({(currentGame.clueSubmissionOrder || []).length})
              </div>
              {cluesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {cluesExpanded && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {(currentGame.clueSubmissionOrder || []).map((playerId: string, index: number) => {
                  const player = room.players.find(p => p.id === playerId);
                  const playerClues = currentGame.clues[playerId] || [];
                  if (!player || playerClues.length === 0) return null;
                  
                  return (
                    <div
                      key={playerId}
                      className="p-3 md:p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="w-5 h-5 md:w-6 md:h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm md:text-base">{player.name}</span>
                        {player.id === currentPlayerId && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{playerClues.length} clue{playerClues.length !== 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="space-y-2">
                        {playerClues.map((clue, clueIndex) => (
                          <div key={clueIndex} className="text-sm md:text-base italic font-medium text-green-800 dark:text-green-200 p-2 bg-white/50 dark:bg-black/20 rounded">
                            <span className="text-xs text-green-600 dark:text-green-400 mr-2">#{clueIndex + 1}</span>
                            "{clue}"
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Players Status Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle 
            className="flex items-center justify-between cursor-pointer text-base md:text-lg"
            onClick={() => setPlayersExpanded(!playersExpanded)}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Players Status
            </div>
            {playersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-xs md:text-sm text-muted-foreground space-y-1 mb-4">
            <div>
              Players ready to vote: {readyPlayersCount}/{room.players.length}
              {readyPlayersCount > room.players.length / 2 && (
                <div className="mt-1 text-primary font-medium">
                  Starting vote soon...
                </div>
              )}
            </div>
            <div>
              Players with clues: {(currentGame.clueSubmissionOrder || []).length}/{room.players.length}
            </div>
            <div className="text-primary font-medium">
              Turn-based clue system: Wait for your turn!
            </div>
          </div>
          
          {playersExpanded && (
            <div className="space-y-2">
              {room.players
                .sort((a, b) => {
                  const aClues = currentGame.clues[a.id]?.length || 0;
                  const bClues = currentGame.clues[b.id]?.length || 0;
                  return bClues - aClues;
                })
                .map((player) => {
                  const clueCount = currentGame.clues[player.id]?.length || 0;
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm md:text-base">{player.name}</span>
                        {player.id === currentPlayerId && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                        {player.isHost && (
                          <Badge variant="secondary" className="text-xs">Host</Badge>
                        )}
                        {player.isReady && (
                          <Badge variant="default" className="text-xs bg-blue-600">Ready</Badge>
                        )}
                      </div>
                      <Badge variant={clueCount > 0 ? "default" : "outline"} className="text-xs">
                        {clueCount} clue{clueCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderVotingPhase = () => (
    <div className="max-w-2xl mx-auto space-y-4 px-4">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Time to Vote!</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Who do you think {currentGame.numImposters > 1 ? 'are the imposters' : 'is the imposter'}?
        </p>
        {isPlayerImposter && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-xs md:text-sm">
            You can vote {maxVotes} time{maxVotes !== 1 ? 's' : ''} (you're an imposter!)
          </div>
        )}
        {!isPlayerImposter && maxVotes > 1 && (
          <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-xs md:text-sm">
            You can vote once
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Vote className="h-4 w-4 md:h-5 md:w-5" />
            Cast Your Vote{maxVotes > 1 ? 's' : ''}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {playerVotes.length > 0 && (
              <div className="mb-2 p-2 bg-secondary/50 rounded-lg">
                <div className="font-medium">Votes cast: {playerVotes.length}/{maxVotes}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {playerVotes.map((voteId, idx) => {
                    const votedPlayer = room.players.find(p => p.id === voteId);
                    return (
                      <div key={idx} className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs">
                        <span>{votedPlayer?.name}</span>
                        <button 
                          onClick={() => handleRemoveVote(voteId)}
                          className="ml-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            Select the player{maxVotes > 1 ? 's' : ''} you believe {maxVotes > 1 ? 'are' : 'is'} the imposter{maxVotes > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {room.players
            .filter(p => p.id !== currentPlayerId)
            .sort((a, b) => {
              const aIndex = (currentGame.clueSubmissionOrder || []).indexOf(a.id);
              const bIndex = (currentGame.clueSubmissionOrder || []).indexOf(b.id);
              return aIndex - bIndex;
            })
            .map((player) => {
              const playerClues = currentGame.clues[player.id] || [];
              const submissionIndex = (currentGame.clueSubmissionOrder || []).indexOf(player.id);
              return (
                <Card
                  key={player.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVote === player.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : playerVotes.includes(player.id)
                      ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => {
                    if (!playerVotes.includes(player.id)) {
                      setSelectedVote(player.id);
                    }
                  }}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {submissionIndex !== undefined && submissionIndex >= 0 && (
                            <span className="w-5 h-5 md:w-6 md:h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                              {submissionIndex + 1}
                            </span>
                          )}
                          <h4 className="font-medium text-sm md:text-base">{player.name}</h4>
                          {player.isHost && (
                            <Badge variant="secondary" className="text-xs">Host</Badge>
                          )}
                          {playerVotes.includes(player.id) && (
                            <Badge variant="default" className="text-xs bg-green-600">✓ Voted</Badge>
                          )}
                        </div>
                        {playerClues.length > 0 && (
                          <div className="pl-0 md:pl-8 space-y-1">
                            {playerClues.map((clue, index) => (
                              <p key={index} className="text-xs md:text-sm text-muted-foreground italic">
                                <span className="text-xs text-muted-foreground/70 mr-1">#{index + 1}</span>
                                "{clue}"
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

          <div className="pt-3 border-t">
            {playerVotes.length < maxVotes ? (
              <Button 
                onClick={handleSubmitVote}
                disabled={!selectedVote || playerVotes.includes(selectedVote)}
                className="w-full text-sm md:text-base"
              >
                <Vote className="h-4 w-4 mr-2" />
                Submit Vote ({playerVotes.length + 1}/{maxVotes})
              </Button>
            ) : (
              <div className="text-center space-y-2">
                <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-xs md:text-sm">
                  ✓ All votes submitted! ({playerVotes.length}/{maxVotes})
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Waiting for other players to finish voting...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContinueOrVotePhase = () => {
    const hasVoted = currentPlayerId in (currentGame.continueVotes || {});
    const voteCount = Object.keys(currentGame.continueVotes || {}).length;
    const continueVoteCount = Object.values(currentGame.continueVotes || {}).filter(vote => vote === true).length;
    const voteVoteCount = Object.values(currentGame.continueVotes || {}).filter(vote => vote === false).length;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">All Clues Submitted!</h2>
          <p className="text-muted-foreground">
            Do you want to continue with new clues or start voting?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Vote to Continue or Start Voting
            </CardTitle>
            <CardDescription>
              Majority decision determines next phase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hasVoted ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => onVoteContinue(true)}
                    variant="outline"
                    className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <div className="text-lg font-semibold">Continue</div>
                    <div className="text-sm text-muted-foreground">Submit new clues</div>
                  </Button>
                  <Button
                    onClick={() => onVoteContinue(false)}
                    variant="outline"
                    className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                  >
                    <div className="text-lg font-semibold">Start Voting</div>
                    <div className="text-sm text-muted-foreground">Vote for imposters</div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-center">
                  ✓ Vote submitted!
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Continue: {continueVoteCount}</span>
                    <span>Vote: {voteVoteCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(continueVoteCount / room.players.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  Waiting for others to vote... ({voteCount}/{room.players.length})
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                Current Clues Summary:
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {(currentGame.clueSubmissionOrder || []).map((playerId: string) => {
                  const player = room.players.find(p => p.id === playerId);
                  const playerClues = currentGame.clues[playerId] || [];
                  if (!player || playerClues.length === 0) return null;
                  
                  return (
                    <div key={playerId} className="flex justify-between text-sm p-2 bg-secondary/50 rounded">
                      <span className="font-medium">{player.name}</span>
                      <div className="space-y-1">
                        {playerClues.map((clue, index) => (
                          <div key={index} className="italic">
                            <span className="text-xs text-muted-foreground mr-1">#{index + 1}</span>
                            "{clue}"
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResultsPhase = () => {
    const results = currentGame.results;
    if (!results) return null;

    const isWinner = results.winners === 'citizens' && !results.imposters.includes(currentPlayerId) ||
                     results.winners === 'imposters' && results.imposters.includes(currentPlayerId);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Game Results</h2>
          <div className={`text-xl font-semibold ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
            {isWinner ? '🎉 You Won!' : '😔 You Lost!'}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Final Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">The Imposters Were:</h3>
              <div className="space-y-2">
                {results.imposters.map(imposterId => {
                  const imposter = room.players.find(p => p.id === imposterId);
                  const imposterWord = currentGame.words[imposterId];
                  return (
                    <div key={imposterId} className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{imposter?.name}</span>
                        <span className="text-sm">Word: "{imposterWord}"</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">All Players & Words:</h3>
              <div className="space-y-2">
                {room.players.map(player => {
                  const playerWord = currentGame.words[player.id];
                  const isImposter = results.imposters.includes(player.id);
                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg ${
                        isImposter 
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{player.name}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">"{playerWord}"</div>
                          <div className="text-xs text-muted-foreground">
                            {currentGame.clues[player.id]?.length > 0 && (
                              <div className="space-y-1">
                                {currentGame.clues[player.id].map((clue, index) => (
                                  <div key={index} className="text-xs text-muted-foreground">
                                    Clue #{index + 1}: "{clue}"
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <div className={`text-lg font-semibold mb-2 ${
                results.winners === 'citizens' ? 'text-green-600' : 'text-red-600'
              }`}>
                {results.winners === 'citizens' ? '🏆 Citizens Win!' : '🎭 Imposters Win!'}
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {results.correctVotes.length > 0 
                  ? `The imposters were correctly identified!`
                  : `The imposters successfully deceived everyone!`
                }
              </p>
              
              {currentPlayer?.isHost && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    What would you like to do next?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={onRestartGame}
                      variant="default"
                      className="h-16 flex flex-col gap-2"
                    >
                      <div className="text-lg font-semibold">🔄 Restart Game</div>
                      <div className="text-sm opacity-90">Same settings, new words</div>
                    </Button>
                    <Button
                      onClick={onReturnToLobby}
                      variant="outline"
                      className="h-16 flex flex-col gap-2"
                    >
                      <div className="text-lg font-semibold">🏠 Back to Lobby</div>
                      <div className="text-sm text-muted-foreground">Choose new game settings</div>
                    </Button>
                  </div>
                </div>
              )}
              
              {!currentPlayer?.isHost && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Waiting for host to decide what to do next...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  switch (room.gameState) {
    case 'in-game':
      return renderInGamePhase();
    case 'continue-or-vote':
      return renderContinueOrVotePhase();
    case 'voting':
      return renderVotingPhase();
    case 'results':
      return renderResultsPhase();
    default:
      return (
        <div className="text-center">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl mb-4">Unknown Game State</h2>
              <p>Please refresh the page.</p>
            </CardContent>
          </Card>
        </div>
      );
  }
}