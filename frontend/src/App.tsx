import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LobbySystem } from '@/components/LobbySystem';
import { GameSelection, GamePlay } from '@/games/guess-the-imposter';
import { useSocket } from '@/hooks/useSocket';
import type { GuessTheImposterRoom, GuessTheImposterGame, GuessTheImposterResults } from '@/games/guess-the-imposter';
import type { Player } from '@/shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

function App() {
  const socket = useSocket();
  const [room, setRoom] = useState<GuessTheImposterRoom | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    setCurrentPlayerId(socket.id || '');

    socket.on('room-joined', (roomData: GuessTheImposterRoom) => {
      setRoom(roomData);
      setError('');
    });

    socket.on('room-updated', (roomData: GuessTheImposterRoom) => {
      setRoom(roomData);
    });

    socket.on('game-started', (game: GuessTheImposterGame) => {
      if (room) {
        setRoom({
          ...room,
          currentGame: game,
          gameState: 'in-game'
        });
      }
    });

    socket.on('player-joined', (player: Player) => {
      console.log('Player joined:', player);
      // Room will be updated via room-updated event
    });

    socket.on('player-left', (playerId: string) => {
      console.log('Player left:', playerId);
      // Room will be updated via room-updated event
    });

    socket.on('clue-submitted', (playerId: string, clue: string, allClues: string[]) => {
      console.log('Clue submitted by:', playerId, 'clue:', clue, 'all clues:', allClues);
      // Room will be updated via room-updated event
    });

    socket.on('turn-changed', (currentTurnPlayerId: string) => {
      if (room?.currentGame) {
        setRoom({
          ...room,
          currentGame: {
            ...room.currentGame,
            currentTurnPlayerId
          }
        });
      }
    });

    socket.on('voting-started', () => {
      if (room) {
        setRoom({
          ...room,
          gameState: 'voting'
        });
      }
    });

    socket.on('vote-submitted', (playerId: string, votedFor: string) => {
      console.log('Vote submitted by:', playerId, 'for:', votedFor);
      // Room will be updated via room-updated event
    });

    socket.on('game-ended', (results: GuessTheImposterResults) => {
      if (room?.currentGame) {
        setRoom({
          ...room,
          gameState: 'results',
          currentGame: {
            ...room.currentGame,
            results
          }
        });
      }
    });

    socket.on('continue-or-vote-prompt', () => {
      if (room) {
        setRoom({
          ...room,
          gameState: 'continue-or-vote'
        });
      }
    });

    socket.on('resubmission-phase', () => {
      if (room) {
        setRoom({
          ...room,
          gameState: 'in-game'
        });
      }
    });

    socket.on('game-restarted', (game: GuessTheImposterGame) => {
      if (room) {
        setRoom({
          ...room,
          currentGame: game,
          gameState: 'in-game'
        });
      }
    });

    socket.on('returned-to-lobby', () => {
      if (room) {
        setRoom({
          ...room,
          gameState: 'waiting',
          currentGame: undefined
        });
      }
    });

    socket.on('host-changed', (newHostId: string, newHostName: string) => {
      console.log('Host changed to:', newHostName);
      // Room will be updated via room-updated event, but we can show a notification
      if (newHostId === currentPlayerId) {
        setError(`You are now the host of the room!`);
        setTimeout(() => setError(''), 3000);
      } else {
        setError(`${newHostName} is now the host.`);
        setTimeout(() => setError(''), 3000);
      }
    });

    socket.on('error', (message: string) => {
      setError(message);
    });

    return () => {
      socket.off('room-joined');
      socket.off('room-updated');
      socket.off('game-started');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('clue-submitted');
      socket.off('turn-changed');
      socket.off('voting-started');
      socket.off('vote-submitted');
      socket.off('game-ended');
      socket.off('continue-or-vote-prompt');
      socket.off('resubmission-phase');
      socket.off('game-restarted');
      socket.off('returned-to-lobby');
      socket.off('host-changed');
      socket.off('error');
    };
  }, [socket, room]);

  const handleCreateRoom = (playerName: string) => {
    console.log('Creating room with player name:', playerName, socket);
    if (socket) {
      socket.emit('create-room', playerName);
    } else {
      setError('Connection not established. Please wait a moment and try again.');
    }
  };

  const handleJoinRoom = (roomCode: string, playerName: string) => {
    console.log('Joining room with code:', roomCode, 'and player name:', playerName, socket);
    if (socket) {
      socket.emit('join-room', roomCode, playerName);
    } else {
      setError('Connection not established. Please wait a moment and try again.');
    }
  };

  const handleStartGame = (gameConfig: { category: GuessTheImposterGame['category']; numImposters: number }) => {
    if (socket) {
      socket.emit('start-game', gameConfig);
    }
  };

  const handleSubmitClue = (clue: string) => {
    console.log('Submitting clue:', clue, socket);
    if (socket) {
      socket.emit('submit-clue', clue);
    }
  };

  const handleReadyToVote = () => {
    if (socket) {
      socket.emit('ready-to-vote');
    }
  };

  const handleSubmitVote = (playerId: string) => {
    if (socket) {
      socket.emit('submit-vote', playerId);
    }
  };

  const handleRemoveVote = (playerId: string) => {
    if (socket) {
      socket.emit('remove-vote', playerId);
    }
  };

  const handleVoteContinue = (continueGame: boolean) => {
    if (socket) {
      socket.emit('vote-continue', continueGame);
    }
  };

  const handleRestartGame = () => {
    if (socket) {
      socket.emit('restart-game');
    }
  };

  const handleReturnToLobby = () => {
    if (socket) {
      socket.emit('return-to-lobby');
    }
  };

  const handleLeaveRoom = () => {
    if (!socket) return;
    
    // Show confirmation if game is in progress
    if (room && ['in-game', 'continue-or-vote', 'voting'].includes(room.gameState)) {
      const confirmLeave = window.confirm(
        'Are you sure you want to leave? The game is currently in progress and you cannot rejoin.'
      );
      if (!confirmLeave) return;
    }
    
    socket.emit('leave-room');
    setRoom(null);
    setError('');
  };

  const renderContent = () => {
    if (!room) {
      return (
        <LobbySystem
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          room={room || undefined}
          currentPlayerId={currentPlayerId}
          isConnected={!!socket}
        />
      );
    }

    const currentPlayer = room.players.find(p => p.id === currentPlayerId);
    const isHost = currentPlayer?.isHost;

    switch (room.gameState) {
      case 'waiting':
        if (isHost) {
          return (
            <div className="space-y-6">
              <LobbySystem
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                room={room}
                currentPlayerId={currentPlayerId}
              />
              <GameSelection
                onStartGame={handleStartGame}
                playerCount={room.players.length}
                isHost={true}
              />
            </div>
          );
        }
        return (
          <LobbySystem
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            room={room}
            currentPlayerId={currentPlayerId}
            isConnected={!!socket}
          />
        );

      case 'in-game':
      case 'continue-or-vote':
      case 'voting':
      case 'results':
        return (
          <GamePlay
            room={room}
            currentPlayerId={currentPlayerId}
            onSubmitClue={handleSubmitClue}
            onReadyToVote={handleReadyToVote}
            onSubmitVote={handleSubmitVote}
            onRemoveVote={handleRemoveVote}
            onVoteContinue={handleVoteContinue}
            onRestartGame={handleRestartGame}
            onReturnToLobby={handleReturnToLobby}
          />
        );

      default:
        return (
          <LobbySystem
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            room={room}
            currentPlayerId={currentPlayerId}
            isConnected={!!socket}
          />
        );
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="trendy-games-theme">
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s', animationDelay: '1s'}}></div>
        </div>

        <header className="relative border-b bg-card/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg hover-scale">
                <span className="text-primary-foreground font-bold text-sm md:text-lg">🎮</span>
              </div>
              <h1 className="text-xl md:text-3xl font-bold gradient-text animate-in bg-red-500 text-white p-2 md:p-4">
                Trendy Games
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {room && (
                <Button
                  onClick={handleLeaveRoom}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <Home className="h-4 w-4" />
                  Leave Room
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="relative container mx-auto px-4 py-6 md:py-12">
          {room && (
            <div className="mb-4 md:mb-6">
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <div>
                        <div className="text-xs md:text-sm text-muted-foreground">Room Code</div>
                        <div className="text-base md:text-lg font-bold text-primary">{room.code}</div>
                      </div>
                      <div>
                        <div className="text-xs md:text-sm text-muted-foreground">Players</div>
                        <div className="text-base md:text-lg font-semibold">{room.players.length}</div>
                      </div>
                      <div>
                        <div className="text-xs md:text-sm text-muted-foreground">Status</div>
                        <div className="text-base md:text-lg font-semibold capitalize">
                          {room.gameState === 'continue-or-vote' ? 'Deciding Next Phase' : room.gameState.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {room.players.map((player) => (
                        <div
                          key={player.id}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            player.id === currentPlayerId
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {player.name}
                          {player.isHost && ' 👑'}
                          {player.id === currentPlayerId && ' (You)'}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <div className="mb-4 md:mb-8 animate-in">
              <Card className="border-destructive/20 bg-destructive/10 backdrop-blur-sm card-shadow-md">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-sm md:text-base">Something went wrong</h3>
                      <p className="text-xs md:text-sm opacity-90">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="animate-in">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative mt-auto py-8 border-t bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Made with ❤️ for fun and games</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;