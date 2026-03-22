# Game Sessions System

## Overview

Party Space has a game sessions system that preserves template integrity while allowing room-specific customization.

## How It Works

### 1. Game Templates (Read-Only)

Game templates are defined in [lib/gameTemplates.ts](lib/gameTemplates.ts) and serve as blueprints for creating games. These templates are **never modified** and remain pristine.

```typescript
// Example template structure
{
  id: 'bet-awards',
  name: 'BET Awards',
  category: 'question-based',
  questions: [
    { title: 'Best Dressed', description: '...', emoji: '👔' },
    // ... more questions
  ]
}
```

### 2. Room Creation from Templates

When a host creates a room from a template ([app/api/rooms/create/route.ts:84-99](app/api/rooms/create/route.ts#L84-L99)):

1. The template's questions are **copied** into new Award documents
2. These Awards are linked to the specific room via `roomId`
3. The original template remains unchanged

```typescript
// Awards are room-specific copies
const awards = template.questions.map((question, index) => ({
  roomId: room._id,  // Room-specific
  title: question.title,
  description: question.description,
  emoji: question.emoji,
  order: index,
  type: question.type || 'voting',
  timeLimit: question.timeLimit
}));
await Award.insertMany(awards);
```

### 3. Game Sessions Tracking

Each room can have multiple game sessions tracked in the Room model ([models/Room.ts:39-55](models/Room.ts#L39-L55)):

```typescript
gameSessions: [{
  gameType: 'bet-awards',
  category: 'question-based',
  startedAt: Date,
  endedAt: Date,
  status: 'active' | 'completed',
  leaderboard: [...]
}]
```

### 4. Admin Page Editing

When a host uses the admin page ([app/admin/page.tsx](app/admin/page.tsx)) to edit challenges:

- They are editing the **room-specific Award copies**, not the template
- Changes only affect the current room
- Original templates in `gameTemplates.ts` remain untouched
- Other rooms using the same template are unaffected

## Data Isolation

### Templates vs Awards

| Aspect | Templates | Awards |
|--------|-----------|--------|
| Location | `lib/gameTemplates.ts` | MongoDB `awards` collection |
| Mutability | Read-only | Room-specific, editable |
| Scope | Global (all rooms) | Single room only |
| Purpose | Blueprints | Actual game questions |

### Room Isolation

Each room has its own isolated set of:
- **Awards** - Questions/challenges specific to this room
- **Participants** - Players in this room
- **Votes** - Voting data for this room
- **GameScores** - Reaction game scores for this room
- **Game Sessions** - Session history for this room

## Benefits

1. **Template Preservation**: Original templates never change
2. **Customization Freedom**: Hosts can edit room-specific questions without affecting other rooms
3. **Reusability**: Same template can be used by multiple rooms simultaneously
4. **Data Isolation**: Each room's data is completely separate
5. **Session History**: Track multiple game sessions within a room

## Example Flow

1. **Create Room**: Host selects "BET Awards" template
   - Template questions copied to Award collection with this room's ID

2. **Customize**: Host edits questions via admin page
   - Changes saved to Award documents (room-specific)
   - Original "BET Awards" template unchanged

3. **Play Game**: Participants play with customized questions
   - GameScore/Vote data linked to specific Award documents

4. **New Room**: Another host creates "BET Awards" room
   - Gets fresh copy of original template
   - First host's customizations don't affect this room

## Architecture Benefits

This architecture ensures:
- **Scalability**: Thousands of rooms can use the same template
- **Data Integrity**: No cross-room data pollution
- **Flexibility**: Hosts have full control over their room's content
- **Consistency**: New rooms always start from clean templates
- **History**: GameSessions array can track multiple rounds within one room

## Future Enhancements

Possible additions to this system:
- Save custom room configurations as new templates
- Clone room configurations between rooms
- Template versioning system
- Community-created templates marketplace
- Session replay and analysis
