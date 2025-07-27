# Folder Structure for Multi-Game Support

This document outlines the new folder structure designed to support multiple games in the Trendy Games platform.

## Backend Structure

```
backend/src/
├── shared/
│   ├── types.ts          # Shared types for rooms, players, socket events
│   └── roomManager.ts    # Room management logic
├── games/
│   └── guess-the-imposter/
│       ├── types.ts      # Game-specific types
│       ├── gameLogic.ts  # Game-specific logic
│       └── wordLists.ts  # Game-specific data
├── gameManager.ts        # Main game manager that orchestrates everything
├── server.ts            # Express server and socket handling
└── legacy files (for backward compatibility)
    ├── types.ts         # Re-exports from new structure
    └── gameLogic.ts     # Re-exports from new structure
```

## Frontend Structure

```
frontend/src/
├── shared/
│   └── types.ts          # Shared types for rooms, players, socket events
├── games/
│   └── guess-the-imposter/
│       ├── types.ts      # Game-specific types
│       ├── GamePlay.tsx  # Game-specific gameplay component
│       ├── GameSelection.tsx # Game-specific selection component
│       └── index.ts      # Game exports
├── components/
│   ├── LobbySystem.tsx   # Shared lobby component
│   └── ui/              # Shared UI components
└── legacy files (for backward compatibility)
    └── types/index.ts   # Re-exports from new structure
```

## Adding New Games

To add a new game (e.g., "card-game"):

### Backend:
1. Create `backend/src/games/card-game/` folder
2. Add game-specific types in `types.ts`
3. Add game logic in `gameLogic.ts`
4. Create a game manager class that implements the game interface
5. Update the main `gameManager.ts` to include the new game

### Frontend:
1. Create `frontend/src/games/card-game/` folder
2. Add game-specific types in `types.ts`
3. Create game components (GamePlay.tsx, GameSelection.tsx, etc.)
4. Export components in `index.ts`
5. Import and use in `App.tsx`

## Benefits

1. **Separation of Concerns**: Each game has its own isolated logic and components
2. **Scalability**: Easy to add new games without affecting existing ones
3. **Maintainability**: Game-specific code is contained and easier to maintain
4. **Reusability**: Shared components and logic can be reused across games
5. **Backward Compatibility**: Legacy imports still work during transition

## Migration Notes

- All existing imports should continue to work
- The old `types.ts` and `gameLogic.ts` files now re-export from the new structure
- Components have been moved but maintain the same interfaces
- Game-specific logic is now properly encapsulated

## Game Interface Pattern

Each game should follow this pattern:

```typescript
// Game-specific types
interface MyGameType {
  type: 'my-game';
  // game-specific properties
}

// Game manager class
class MyGameManager {
  createGame(): MyGameType | null
  // other game-specific methods
}

// Frontend components
export function GamePlay(props: MyGameProps) { ... }
export function GameSelection(props: MyGameSelectionProps) { ... }
```

This structure ensures consistency across all games while allowing for game-specific customization.