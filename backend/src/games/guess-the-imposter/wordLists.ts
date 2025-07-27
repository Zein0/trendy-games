export const WORD_LISTS = {
  actors: [
    'Leonardo DiCaprio', 'Meryl Streep', 'Robert De Niro', 'Scarlett Johansson', 'Tom Hanks',
    'Jennifer Lawrence', 'Brad Pitt', 'Angelina Jolie', 'Will Smith', 'Emma Stone',
    'Ryan Gosling', 'Natalie Portman', 'Matt Damon', 'Anne Hathaway', 'Christian Bale',
    'Sandra Bullock', 'Johnny Depp', 'Julia Roberts', 'George Clooney', 'Charlize Theron',
    'Hugh Jackman', 'Amy Adams', 'Ryan Reynolds', 'Emma Watson', 'Chris Evans',
    'Margot Robbie', 'Denzel Washington', 'Cate Blanchett', 'Jake Gyllenhaal', 'Reese Witherspoon'
  ],
  movies: [
    'The Godfather', 'Titanic', 'Avatar', 'The Dark Knight', 'Pulp Fiction',
    'Forrest Gump', 'Inception', 'The Matrix', 'Star Wars', 'Jurassic Park',
    'The Lion King', 'E.T.', 'Jaws', 'The Avengers', 'Frozen',
    'Black Panther', 'Spider-Man', 'Iron Man', 'Batman Begins', 'The Shawshank Redemption',
    'Goodfellas', 'Casablanca', 'Gone with the Wind', 'Lawrence of Arabia', 'Schindler\'s List',
    'Citizen Kane', 'Vertigo', 'Psycho', 'Singin\' in the Rain', 'Some Like It Hot'
  ],
  'football-athletes': [
    'Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Kylian Mbappé', 'Erling Haaland',
    'Kevin De Bruyne', 'Mohamed Salah', 'Sadio Mané', 'Virgil van Dijk', 'Luka Modrić',
    'Karim Benzema', 'Robert Lewandowski', 'Harry Kane', 'Son Heung-min', 'Raheem Sterling',
    'Riyad Mahrez', 'Bruno Fernandes', 'Paul Pogba', 'N\'Golo Kanté', 'Thiago Silva',
    'Sergio Ramos', 'Marcelo', 'Dani Alves', 'Jordi Alba', 'Trent Alexander-Arnold',
    'Joshua Kimmich', 'Thomas Müller', 'Marco Verratti', 'Pedri', 'Jamal Musiala'
  ],
  animals: [
    'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra',
    'Penguin', 'Polar Bear', 'Kangaroo', 'Koala', 'Panda',
    'Dolphin', 'Whale', 'Shark', 'Eagle', 'Owl',
    'Wolf', 'Fox', 'Rabbit', 'Squirrel', 'Deer',
    'Horse', 'Cow', 'Pig', 'Sheep', 'Goat',
    'Cat', 'Dog', 'Monkey', 'Gorilla', 'Chimpanzee'
  ],
  'football-clubs': [
    'Manchester United', 'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal',
    'Tottenham', 'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla',
    'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Juventus', 'AC Milan',
    'Inter Milan', 'Napoli', 'AS Roma', 'Paris Saint-Germain', 'Olympique Marseille',
    'Ajax', 'PSV Eindhoven', 'Benfica', 'Porto', 'Sporting CP',
    'Celtic', 'Rangers', 'Galatasaray', 'Fenerbahçe', 'Besiktas'
  ]
};

export function getRandomWord(category: keyof typeof WORD_LISTS): string {
  const words = WORD_LISTS[category];
  return words[Math.floor(Math.random() * words.length)];
}

export function getRandomWords(category: keyof typeof WORD_LISTS, count: number, excludeWord?: string): string[] {
  const words = [...WORD_LISTS[category]];
  const selected: string[] = [];
  
  if (excludeWord) {
    const excludeIndex = words.indexOf(excludeWord);
    if (excludeIndex > -1) {
      words.splice(excludeIndex, 1);
    }
  }
  
  for (let i = 0; i < count && words.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selected.push(words.splice(randomIndex, 1)[0]);
  }
  
  return selected;
}