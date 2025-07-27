import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, Play } from 'lucide-react';
import type { Game } from '../types';

interface GameSelectionProps {
  onStartGame: (gameConfig: { category: Game['category']; numImposters: number }) => void;
  playerCount: number;
  isHost: boolean;
}

const GAME_CATEGORIES = [
  { id: 'actors' as const, name: 'Actors', description: 'Famous actors and actresses' },
  { id: 'movies' as const, name: 'Movies', description: 'Popular films and cinema' },
  { id: 'football-athletes' as const, name: 'Football Players', description: 'Professional football stars' },
  { id: 'animals' as const, name: 'Animals', description: 'Creatures from around the world' },
  { id: 'football-clubs' as const, name: 'Football Clubs', description: 'Professional football teams' },
];

export function GameSelection({ onStartGame, playerCount, isHost }: GameSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<Game['category'] | null>(null);
  const [numImposters, setNumImposters] = useState(1);

  const maxImposters = Math.floor(playerCount / 2);

  const handleStartGame = () => {
    if (selectedCategory) {
      onStartGame({ category: selectedCategory, numImposters });
    }
  };

  if (!isHost) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Waiting for Game Setup</h3>
            <p className="text-muted-foreground">
              The host is selecting a game for everyone to play.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose a Game</h2>
        <p className="text-muted-foreground">
          Select a category and number of imposters to start playing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Guess the Imposter
          </CardTitle>
          <CardDescription>
            Players receive words from a category. Imposters get different words and must blend in!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Select Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {GAME_CATEGORIES.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-1">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Number of Imposters</h3>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: maxImposters }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  variant={numImposters === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNumImposters(num)}
                  className="min-w-[60px]"
                >
                  {num}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              With {playerCount} players, you can have up to {maxImposters} imposters
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {playerCount} players
              </Badge>
              {selectedCategory && (
                <Badge variant="outline">
                  {GAME_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
              <Badge variant="outline">
                {numImposters} imposter{numImposters > 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              onClick={handleStartGame}
              disabled={!selectedCategory}
              className="min-w-[120px]"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}