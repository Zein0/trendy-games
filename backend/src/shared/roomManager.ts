import { v4 as uuidv4 } from 'uuid';
import { Room, Player } from './types';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();

  generateRoomCode(): string {
    let code: string;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostId: string, hostName: string): Room {
    const roomId = uuidv4();
    const code = this.generateRoomCode();
    
    const host: Player = {
      id: hostId,
      name: hostName,
      isHost: true,
      isReady: false
    };

    const room: Room = {
      id: roomId,
      code,
      hostId,
      players: [host],
      gameState: 'waiting'
    };

    this.rooms.set(code, room);
    this.playerRooms.set(hostId, code);
    
    return room;
  }

  joinRoom(roomCode: string, playerId: string, playerName: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.players.find(p => p.id === playerId)) return room;

    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: false,
      isReady: false
    };

    room.players.push(player);
    this.playerRooms.set(playerId, roomCode);
    
    return room;
  }

  leaveRoom(playerId: string): { room: Room | null; hostChanged: boolean; newHost?: Player } {
    const roomCode = this.playerRooms.get(playerId);
    if (!roomCode) return { room: null, hostChanged: false };

    const room = this.rooms.get(roomCode);
    if (!room) return { room: null, hostChanged: false };

    const wasHost = room.hostId === playerId;
    room.players = room.players.filter(p => p.id !== playerId);
    this.playerRooms.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return { room: null, hostChanged: false };
    }

    let newHost;
    if (wasHost && room.players.length > 0) {
      newHost = room.players[0];
      newHost.isHost = true;
      room.hostId = newHost.id;
    }

    return { room, hostChanged: wasHost, newHost };
  }

  getRoom(roomCode: string): Room | null {
    return this.rooms.get(roomCode) || null;
  }

  getRoomByPlayerId(playerId: string): Room | null {
    const roomCode = this.playerRooms.get(playerId);
    return roomCode ? this.rooms.get(roomCode) || null : null;
  }

  resetRoom(roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    room.gameState = 'waiting';
    room.currentGame = undefined;
    room.players.forEach(p => p.isReady = false);
    
    return true;
  }
}