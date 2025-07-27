import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Users, Copy, Check } from 'lucide-react';
import type { Room } from '../shared/types';

interface LobbySystemProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  room?: Room;
  currentPlayerId?: string;
  isConnected?: boolean;
}

export function LobbySystem({ onCreateRoom, onJoinRoom, room, currentPlayerId, isConnected = true }: LobbySystemProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const copyRoomCode = async () => {
    if (room?.code) {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (room && currentPlayerId) {
    const currentPlayer = room.players.find(p => p.id === currentPlayerId);
    
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-card/90 via-card to-primary/5 backdrop-blur-md overflow-hidden card-shadow-xl hover-lift animate-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 pointer-events-none"></div>
          <CardHeader className="text-center pb-8 relative">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-xl bounce-in">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-4">
              Room: <span className="font-mono bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent glow">{room.code}</span>
            </CardTitle>
            <CardDescription className="text-lg mb-6 text-muted-foreground">
              Share this code with your friends to join the game 🚀
            </CardDescription>
            <Button
              variant="outline"
              onClick={copyRoomCode}
              className="mx-auto border-2 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover-lift shadow-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {copied ? (
                <>
                  <Check className="h-5 w-5 mr-3 text-green-500" />
                  <span className="text-green-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-3" />
                  <span className="font-bold">Copy Room Code</span>
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="px-8 pb-8 relative">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse glow"></div>
                    Players Online
                  </h3>
                  <span className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20">
                    {room.players.length} connected
                  </span>
                </div>
                <div className="grid gap-4">
                  {room.players.map((player) => (
                    <div
                      key={player.id}
                      className={`group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-muted/40 to-muted/20 border  hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover-lift stagger-item animate-in`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center border-2 border-primary/30 shadow-md">
                          <span className="font-bold text-lg">{player.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-bold text-xl">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {player.isHost && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover-scale">
                            👑 Host
                          </span>
                        )}
                        {player.id === currentPlayerId && (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover-scale">
                            ✨ You
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {currentPlayer?.isHost && room.gameState === 'waiting' && (
                <div className="pt-8 border-t ">
                  <div className="text-center p-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 backdrop-blur-sm animate-in hover-lift">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 bounce-in shadow-xl">
                      <span className="text-white font-bold text-2xl">🎮</span>
                    </div>
                    <p className="text-green-700 dark:text-green-300 font-bold text-xl mb-3">
                      Ready to start the game?
                    </p>
                    <p className="text-muted-foreground text-lg">
                      You can begin once everyone is ready! ⚡
                    </p>
                  </div>
                </div>
              )}

              {!currentPlayer?.isHost && room.gameState === 'waiting' && (
                <div className="pt-8 border-t ">
                  <div className="text-center p-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30 backdrop-blur-sm animate-in hover-lift">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 float shadow-xl">
                      <span className="text-white font-bold text-2xl">⏳</span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 font-bold text-xl mb-3">
                      Waiting for the host...
                    </p>
                    <p className="text-muted-foreground text-lg">
                      The game will start soon! 🎯
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center space-y-6 animate-in">
        <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-3xl flex items-center justify-center shadow-xl hover-lift float">
          <Users className="h-12 w-12 text-primary-foreground" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl"></div>
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent animate-in-delay-1">
            Trendy Games
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed animate-in-delay-2">
            Connect with friends and enjoy exciting games together! 🎯
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-gradient-to-br from-card/80 via-card to-muted/10 backdrop-blur-md card-shadow-xl hover-lift animate-in-delay-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none rounded-xl"></div>
        <CardHeader className="text-center pb-8 relative">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse glow"></div>
            Join the Fun
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse glow" style={{animationDelay: '0.5s'}}></div>
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Enter your name to start your gaming adventure ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-8 relative">
          {!isConnected && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-center mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Connecting to server...</span>
              </div>
              <p className="text-sm mt-1">Please wait while we establish a connection.</p>
            </div>
          )}
          
          {isConnected && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-center mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Connected to server</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Name</label>
            <Input
              placeholder="Enter your display name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-14 text-lg border-2 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30 hover-lift"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (isJoining) {
                    handleJoinRoom();
                  } else {
                    handleCreateRoom();
                  }
                }
              }}
            />
          </div>

          {!isJoining ? (
            <div className="space-y-6 animate-in">
              <Button 
                onClick={handleCreateRoom} 
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift border-0 relative overflow-hidden group"
                disabled={!playerName.trim() || !isConnected}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Users className="h-6 w-6 mr-3" />
                {!isConnected ? 'Connecting...' : 'Create New Room'}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-semibold tracking-wider">or</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsJoining(true)} 
                className="w-full h-14 text-lg font-bold border-2 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover-lift relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                Join Existing Room
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Room Code</label>
                <Input
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="h-14 text-xl font-mono text-center tracking-[0.3em] border-2 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 hover:border-primary/30 hover-lift"
                  maxLength={6}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinRoom();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleJoinRoom} 
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift border-0 relative overflow-hidden group"
                disabled={!playerName.trim() || !roomCode.trim() || !isConnected}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {!isConnected ? 'Connecting...' : 'Join Room'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsJoining(false);
                  setRoomCode('');
                }} 
                className="w-full h-14 text-lg font-semibold hover:bg-muted/50 transition-all duration-300 hover-scale"
              >
                ← Back to Create Room
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}