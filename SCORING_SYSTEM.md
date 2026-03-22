# Party Space Scoring System

## Overview

Party Space now has a flexible scoring framework that supports both **reaction games** (competitive scoring) and **voting games** (peer voting).

## Architecture

### Models

1. **GameScore** (`models/GameScore.ts`)
   - Stores scores for reaction games
   - Supports flexible game-specific metrics
   - Fields:
     - `score`: Primary score for leaderboard
     - `metrics`: Game-specific data (JSON object)
     - `timeSpent`: Time in seconds
     - `isCorrect`: For quiz games

2. **Vote** (`models/Vote.ts`) - Existing
   - Stores votes for voting games
   - Used for "BET Awards" style games

### API Endpoints

#### POST `/api/rooms/:roomId/scores`
Submit a game score with metrics.

**Request Body:**
```json
{
  "participantId": "string",
  "awardId": "string",
  "gameType": "string",
  "score": number,
  "metrics": {
    // Game-specific data
    "avgReactionTime": number,
    "bestTime": number,
    "accuracy": number,
    // ... any custom fields
  },
  "timeSpent": number,
  "isCorrect": boolean
}
```

#### GET `/api/rooms/:roomId/scores`
Get all scores for a room.

**Query Params:**
- `participantId` (optional): Filter by participant
- `awardId` (optional): Filter by challenge

#### POST `/api/rooms/:roomId/votes`
Submit a vote (for voting games).

**Request Body:**
```json
{
  "participantId": "string",
  "awardId": "string",
  "nominee": "string",
  "answer": "string",
  "timeSpent": number,
  "isCorrect": boolean
}
```

#### GET `/api/rooms/:roomId/leaderboard`
Get calculated leaderboard.

- **Reaction games**: Sums scores from GameScore model
- **Voting games**: Counts votes from Vote model

## Game API Helper

All HTML games can use `/games/game-api.js` for easy integration.

### Usage

```javascript
// 1. Include the script
<script src="/games/game-api.js"></script>

// 2. Initialize
const gameAPI = new GameAPI(roomId, participantId, awardId, 'game-type');

// 3. Submit score with metrics
await gameAPI.completeGame({
  score: 500,
  metrics: {
    avgReactionTime: 320,
    bestReactionTime: 280,
    accuracy: 95,
    rounds: 5
  },
  timeSpent: 45
}, 2000); // 2 second delay before advancing
```

### API Methods

#### `submitScore(data)`
Submit score directly.
```javascript
await gameAPI.submitScore({
  score: 100,
  metrics: { /* custom data */ },
  timeSpent: 30,
  isCorrect: true
});
```

#### `submitVote(data)`
Submit vote (for voting games).
```javascript
await gameAPI.submitVote({
  nominee: "John",
  answer: "John",
  timeSpent: 10
});
```

#### `notifyComplete(data)`
Notify parent window game is done.
```javascript
gameAPI.notifyComplete({ score: 100 });
```

#### `completeGame(scoreData, delay)`
All-in-one: Submit score, wait, notify parent.
```javascript
await gameAPI.completeGame({
  score: 500,
  metrics: { /* metrics */ }
}, 2000);
```

## Game-Specific Metrics Examples

### Reflex Test
```javascript
{
  score: 450,
  metrics: {
    avgReactionTime: 285,
    bestReactionTime: 210,
    reactionTimes: [250, 210, 300, 280, 285],
    roundsCompleted: 5
  }
}
```

### Memory Flash
```javascript
{
  score: 70,
  metrics: {
    roundsCompleted: 7,
    longestSequence: 9,
    totalAttempts: 7,
    accuracy: 100
  }
}
```

### Word Race
```javascript
{
  score: 250,
  metrics: {
    wpm: 62,
    wordsTyped: 31,
    accuracy: 97,
    correctWords: 30,
    wrongWords: 1
  }
}
```

### Tap Battle
```javascript
{
  score: 342,
  metrics: {
    tapsPerSecond: 34.2,
    totalTaps: 342,
    duration: 10
  }
}
```

### Color Match
```javascript
{
  score: 180,
  metrics: {
    correctMatches: 18,
    wrongMatches: 3,
    accuracy: 85.7,
    avgResponseTime: 850
  }
}
```

### Quick Math
```javascript
{
  score: 220,
  metrics: {
    correctAnswers: 22,
    wrongAnswers: 5,
    accuracy: 81.5,
    avgResponseTime: 1200
  }
}
```

## Leaderboard Calculation

### Reaction Games
- Sums all `score` values from GameScore model per participant
- Detailed metrics stored but not used for ranking
- Sorted by total score (highest first)

### Voting Games
- Counts number of votes received per participant
- Each vote = 1 point
- Sorted by vote count (highest first)

## Migration Notes

- Old games using `/api/rooms/:roomId/votes` still work
- New games should use `/api/rooms/:roomId/scores` for better metrics
- Leaderboard automatically detects game category (reaction vs voting)
- Backward compatible with existing Vote model

## Adding New Games

1. Include `game-api.js` in your HTML
2. Initialize GameAPI with game type
3. Track your metrics during gameplay
4. Call `completeGame()` with score and metrics
5. Done! Leaderboard automatically includes your game.
