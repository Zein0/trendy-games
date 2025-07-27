# 🎮 Trendy Games

A real-time multiplayer gaming platform built with React, TypeScript, Node.js, and Socket.IO. Currently featuring "Guess the Imposter" with support for multiple games.

## Features

- **Lobby System**: Create and join private rooms with unique codes
- **Real-time Gameplay**: WebSocket-powered instant communication
- **Dark/Light Theme**: Toggle between themes with system preference support
- **Mobile Responsive**: Optimized for all device sizes
- **Game Categories**: Actors, Movies, Football Players, Animals, Football Clubs
- **Voting System**: Democratic elimination of suspected imposters
- **Results Display**: Comprehensive game outcome visualization

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for blazing fast development
- TailwindCSS + ShadCN UI components
- Socket.IO client for real-time communication
- Lucide React for icons

### Backend
- Node.js + Express + TypeScript
- Socket.IO for WebSocket management
- UUID for unique room generation
- CORS enabled for cross-origin requests

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trendy-games
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```
Server will run on http://localhost:3001

2. Start the frontend development server:
```bash
cd frontend  
npm run dev
```
Application will be available at http://localhost:5173

## How to Play

### Game Setup
1. **Create a Room**: Enter your name and create a new game room
2. **Share Room Code**: Give the generated code to friends to join
3. **Host Controls**: Only the room creator can select game settings and start

### Guess the Imposter Rules
1. **Word Assignment**: All players get the same word except imposters who get different words
2. **Clue Phase**: Each player submits a clue describing their word without saying it directly
3. **Voting Phase**: Players vote for who they think is the imposter
4. **Victory Conditions**:
   - **Citizens win**: If they correctly identify all imposters
   - **Imposters win**: If they avoid detection

### Game Categories
- **Actors**: Famous movie and TV personalities
- **Movies**: Popular films and cinema classics  
- **Football Players**: International soccer superstars
- **Animals**: Creatures from around the world
- **Football Clubs**: Professional soccer teams

## Project Structure

```
trendy-games/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express + Socket.IO server
│   │   ├── gameLogic.ts       # Game management logic
│   │   ├── wordLists.ts       # Category word databases
│   │   └── types.ts           # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/            # ShadCN UI components
│   │   │   ├── LobbySystem.tsx
│   │   │   ├── GameSelection.tsx
│   │   │   └── GamePlay.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript definitions
│   │   ├── lib/               # Utility functions
│   │   └── App.tsx            # Main application component
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

Create `.env` files in the backend directory:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
```

## Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build`
2. Set environment variables for production
3. Start with: `npm start`

### Frontend Deployment  
1. Build for production: `npm run build`
2. Serve the `dist` folder with any static file server
3. Update backend URL in the frontend code for production

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'` 
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Additional game modes
- [ ] Player statistics and leaderboards
- [ ] Custom word lists
- [ ] Voice chat integration
- [ ] Tournament mode
- [ ] Spectator mode
- [ ] Room moderation tools