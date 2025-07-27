import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameManager } from './gameManager';
import { ServerToClientEvents, ClientToServerEvents } from './shared/types';

dotenv.config();

const app = express();
const server = createServer(app);

// Log environment variables on startup
console.log('🚀 Server starting with environment:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   CLIENT_URL:', process.env.CLIENT_URL);
console.log('   PORT:', process.env.PORT);

// Helper function to normalize URLs and handle multiple origins
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const clientUrl = process.env.CLIENT_URL;
    if (clientUrl) {
      // Remove trailing slash and create variations
      const baseUrl = clientUrl.replace(/\/$/, '');
      const origins = [baseUrl, `${baseUrl}/`];
      console.log('🌐 Production CORS origins:', origins);
      return origins;
    }
    console.log('⚠️  No CLIENT_URL found in production environment');
    return [];
  }
  const devOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
  console.log('🔧 Development CORS origins:', devOrigins);
  return devOrigins;
};

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Add logging middleware for CORS debugging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    console.log(`📡 Request from origin: ${origin}`);
  }
  next();
});

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true
}));
app.use(express.json());

const gameManager = new GameManager();

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', (playerName) => {
    try {
      const room = gameManager.createRoom(socket.id, playerName);
      socket.join(room.code);
      socket.emit('room-joined', room);
      console.log(`Room created: ${room.code} by ${playerName}`);
    } catch (error) {
      socket.emit('error', 'Failed to create room');
    }
  });

  socket.on('join-room', (roomCode, playerName) => {
    try {
      const room = gameManager.joinRoom(roomCode, socket.id, playerName);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      socket.join(roomCode);
      socket.emit('room-joined', room);
      socket.to(roomCode).emit('player-joined', room.players.find(p => p.id === socket.id)!);
      socket.to(roomCode).emit('room-updated', room);
      console.log(`${playerName} joined room: ${roomCode}`);
    } catch (error) {
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('leave-room', () => {
    try {
      const { shouldEndGame, room, hostChanged, newHost } = gameManager.handlePlayerLeaving(socket.id);
      if (room) {
        socket.to(room.code).emit('player-left', socket.id);
        socket.to(room.code).emit('room-updated', room);
        socket.leave(room.code);
        
        if (hostChanged && newHost) {
          io.to(room.code).emit('host-changed', newHost.id, newHost.name);
        }
        
        if (shouldEndGame && room.currentGame?.results) {
          io.to(room.code).emit('game-ended', room.currentGame.results);
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  socket.on('start-game', (gameConfig) => {
    try {
      const room = gameManager.getRoomByPlayerId(socket.id);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== socket.id) {
        socket.emit('error', 'Only host can start game');
        return;
      }

      const game = gameManager.startGame(room.code, socket.id, gameConfig);
      if (!game) {
        socket.emit('error', 'Failed to start game');
        return;
      }

      io.to(room.code).emit('game-started', game);
      io.to(room.code).emit('room-updated', room);
      console.log(`Game started in room: ${room.code}`);
    } catch (error) {
      socket.emit('error', 'Failed to start game');
    }
  });

  socket.on('submit-clue', (clue) => {
    try {
      const success = gameManager.submitClue(socket.id, clue);
      if (!success) {
        socket.emit('error', 'Failed to submit clue or not your turn');
        return;
      }

      const room = gameManager.getRoomByPlayerId(socket.id);
      if (room && room.currentGame) {
        // Get all clues for this player
        const allClues = room.currentGame.clues[socket.id] || [];
        
        // Notify all players about the clue submission
        io.to(room.code).emit('clue-submitted', socket.id, clue, allClues);
        io.to(room.code).emit('room-updated', room);
      }
    } catch (error) {
      socket.emit('error', 'Failed to submit clue');
    }
  });

  socket.on('ready-to-vote', () => {
    try {
      const room = gameManager.getRoomByPlayerId(socket.id);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      // Allow ready-to-vote at any time during the game

      const success = gameManager.setPlayerReady(socket.id);
      if (!success) {
        socket.emit('error', 'Failed to set ready status');
        return;
      }

      io.to(room.code).emit('room-updated', room);
      
      if (gameManager.canStartVoting(room.code)) {
        gameManager.startVoting(room.code);
        io.to(room.code).emit('voting-started');
        io.to(room.code).emit('room-updated', room);
      }
    } catch (error) {
      socket.emit('error', 'Failed to process ready status');
    }
  });

  socket.on('submit-vote', (votedForId) => {
    try {
      const success = gameManager.submitVote(socket.id, votedForId);
      if (!success) {
        socket.emit('error', 'Failed to submit vote');
        return;
      }

      const room = gameManager.getRoomByPlayerId(socket.id);
      if (room) {
        io.to(room.code).emit('room-updated', room);
        
        if (gameManager.canEndGame(room.code)) {
          const results = gameManager.endGame(room.code);
          if (results) {
            io.to(room.code).emit('game-ended', results);
            io.to(room.code).emit('room-updated', room);
          }
        }
      }
    } catch (error) {
      socket.emit('error', 'Failed to submit vote');
    }
  });

  socket.on('remove-vote', (votedForId) => {
    try {
      const success = gameManager.removeVote(socket.id, votedForId);
      if (!success) {
        socket.emit('error', 'Failed to remove vote');
        return;
      }

      const room = gameManager.getRoomByPlayerId(socket.id);
      if (room) {
        io.to(room.code).emit('room-updated', room);
      }
    } catch (error) {
      socket.emit('error', 'Failed to remove vote');
    }
  });

  socket.on('vote-continue', (continueGame) => {
    try {
      const room = gameManager.getRoomByPlayerId(socket.id);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      const success = gameManager.submitContinueVote(socket.id, continueGame);
      if (!success) {
        socket.emit('error', 'Failed to submit continue vote');
        return;
      }

      io.to(room.code).emit('room-updated', room);

      if (gameManager.hasAllPlayersContinueVoted(room.code)) {
        if (gameManager.shouldContinueGame(room.code)) {
          // Majority wants to continue, reset for resubmission
          gameManager.resetForResubmission(room.code);
          io.to(room.code).emit('resubmission-phase');
          io.to(room.code).emit('room-updated', room);
        } else {
          // Majority wants to vote, start voting phase
          gameManager.startVoting(room.code);
          io.to(room.code).emit('voting-started');
          io.to(room.code).emit('room-updated', room);
        }
      }
    } catch (error) {
      socket.emit('error', 'Failed to process continue vote');
    }
  });

  socket.on('restart-game', () => {
    try {
      const room = gameManager.getRoomByPlayerId(socket.id);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== socket.id) {
        socket.emit('error', 'Only host can restart game');
        return;
      }

      if (room.gameState !== 'results') {
        socket.emit('error', 'Can only restart after game ends');
        return;
      }

      const game = gameManager.restartGame(room.code, socket.id);
      if (!game) {
        socket.emit('error', 'Failed to restart game');
        return;
      }

      io.to(room.code).emit('game-restarted', game);
      io.to(room.code).emit('room-updated', room);
      console.log(`Game restarted in room: ${room.code}`);
    } catch (error) {
      socket.emit('error', 'Failed to restart game');
    }
  });

  socket.on('return-to-lobby', () => {
    try {
      const room = gameManager.getRoomByPlayerId(socket.id);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== socket.id) {
        socket.emit('error', 'Only host can return to lobby');
        return;
      }

      if (room.gameState !== 'results') {
        socket.emit('error', 'Can only return to lobby after game ends');
        return;
      }

      const success = gameManager.resetRoom(room.code);
      if (!success) {
        socket.emit('error', 'Failed to return to lobby');
        return;
      }

      io.to(room.code).emit('returned-to-lobby');
      io.to(room.code).emit('room-updated', room);
      console.log(`Returned to lobby in room: ${room.code}`);
    } catch (error) {
      socket.emit('error', 'Failed to return to lobby');
    }
  });

  socket.on('disconnect', () => {
    try {
      const { shouldEndGame, room, hostChanged, newHost } = gameManager.handlePlayerLeaving(socket.id);
      if (room) {
        socket.to(room.code).emit('player-left', socket.id);
        socket.to(room.code).emit('room-updated', room);
        
        if (hostChanged && newHost) {
          io.to(room.code).emit('host-changed', newHost.id, newHost.name);
        }
        
        if (shouldEndGame && room.currentGame?.results) {
          io.to(room.code).emit('game-ended', room.currentGame.results);
        }
      }
      console.log('User disconnected:', socket.id);
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});