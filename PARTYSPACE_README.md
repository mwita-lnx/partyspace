# PartySpace - Simplified Game Platform

## Project Rename
**bet-awards** → **partyspace**

## Major Changes

### 1. Removed Room/Participant Logic
- Eliminated complex room management system
- Removed Participant model entirely
- Simplified to session-based architecture

### 2. New Data Models

#### GameSession Model
Replaces the Room model with a simpler structure:
```typescript
{
  code: string; // 4-digit PIN
  name: string;
  description?: string;
  hostUserId: ObjectId; // Authenticated user who created it
  hostName: string; // Display name
  gameType: 'bet-awards' | 'custom';
  status: 'waiting' | 'active' | 'ended';
  settings: {
    showLiveResults: boolean;
    maxParticipants: number;
  }
}
```

#### Updated Award Model
- Changed: `roomId` → `sessionId`
- References GameSession instead of Room

#### Updated Vote Model
- Changed: `roomId` → `sessionId`
- Removed: `participantId` (no more Participant model)
- Added: `voterName` (string) - Anonymous voter identification
- Added: `voterEmail?` (optional) - If they're logged in

### 3. Simplified User Flow

**Host Flow:**
```
1. Visit /bet-awards/create
2. Login with email + name
3. Create session → Get PIN
4. Redirected to /partyspace/[PIN]/settings
5. Add nominees to awards
6. Share PIN with players
7. View results at /partyspace/[PIN]/results
```

**Player Flow:**
```
1. Receive PIN from host
2. Visit /partyspace/[PIN]
3. Enter name (NO login, NO participant creation)
4. Vote on awards
5. View results
```

### 4. New API Structure

All new routes under `/api/sessions/`:

#### Session Management
- `POST /api/sessions/create` - Create game session (auth required)
- `GET /api/sessions/[code]` - Get session by PIN

#### Awards Management
- `GET /api/sessions/[sessionId]/awards` - List all awards
- `POST /api/sessions/[sessionId]/awards` - Create custom award
- `PATCH /api/sessions/[sessionId]/awards/[awardId]` - Update nominees
- `DELETE /api/sessions/[sessionId]/awards/[awardId]` - Delete award

#### Voting & Results
- `POST /api/sessions/[sessionId]/vote` - Submit vote
- `GET /api/sessions/[sessionId]/results` - Get results with vote counts

### 5. New Route Structure

#### Main Routes
- `/bet-awards/create` - Create new session (auth required)
- `/partyspace/[pin]` - Join with PIN (no auth)
- `/partyspace/[pin]/settings` - Manage nominees (host only by convention)
- `/partyspace/[pin]/results` - View results with charts

### 6. Removed Complexity

**What's Gone:**
- ❌ Room model
- ❌ Participant model
- ❌ Room joining API
- ❌ Participant codes
- ❌ Room lobbies
- ❌ Participant tracking
- ❌ Host verification
- ❌ Room status management

**What Remains:**
- ✅ GameSession (simple)
- ✅ User authentication for hosts
- ✅ Awards with nominees
- ✅ Anonymous voting
- ✅ Results with charts
- ✅ PIN-based access

### 7. Data Storage

**Client-side (localStorage):**
```javascript
// When host creates session
localStorage.setItem('currentSession', JSON.stringify(session));
localStorage.setItem('voterName', hostName);

// When player joins
localStorage.setItem('currentSession', JSON.stringify(session));
localStorage.setItem('voterName', playerName);
```

**Database:**
- GameSession collection
- Award collection (linked to sessions)
- Vote collection (anonymous voters)
- User collection (hosts only)

### 8. Authentication

**Required:**
- Creating a game session (hosts must login)

**Optional:**
- Playing/voting (anyone with PIN can participate anonymously)

### 9. File Structure

```
models/
├── GameSession.ts      // NEW - Replaces Room
├── Award.ts            // UPDATED - Uses sessionId
├── Vote.ts             // UPDATED - Uses sessionId + voterName
└── User.ts             // Auth for hosts

app/api/sessions/
├── create/route.ts
├── [code]/route.ts
├── [sessionId]/awards/route.ts
├── [sessionId]/awards/[awardId]/route.ts
├── [sessionId]/vote/route.ts
└── [sessionId]/results/route.ts

app/bet-awards/
└── create/page.tsx     // UPDATED - Creates GameSession

app/partyspace/
└── [pin]/
    ├── page.tsx        // NEW - Landing/join page
    ├── settings/       // TODO - Update for sessions
    ├── play/           // TODO - Update for sessions
    └── results/        // TODO - Update for sessions
```

### 10. Benefits of New Architecture

**Simpler:**
- No participant registration
- No room management complexity
- Fewer database models
- Easier to understand

**Faster:**
- Less API calls
- No participant creation overhead
- Immediate join with just a name

**More Flexible:**
- Anonymous participation
- Optional email tracking
- Easy to add new game types

### 11. Migration Notes

**Breaking Changes:**
- All old `/api/rooms/` routes deprecated
- Participant-based flows removed
- Room codes replaced with session PINs

**Data Migration:**
If you have existing data, you'll need to:
1. Convert Room documents to GameSession documents
2. Update Award documents: roomId → sessionId
3. Update Vote documents: add voterName, remove participantId
4. Delete Participant collection

### 12. Next Steps

1. **Update Settings Page** (`/partyspace/[pin]/settings`)
   - Use `/api/sessions/[sessionId]/awards` instead of room API
   - Remove participant fetching logic

2. **Update Play Page** (`/partyspace/[pin]/play`)
   - Use `/api/sessions/[sessionId]/vote` for voting
   - No participant tracking needed

3. **Update Results Page** (`/partyspace/[pin]/results`)
   - Use `/api/sessions/[sessionId]/results`
   - Display voter names instead of participant names

4. **Remove Old Files**
   - Delete `/app/api/rooms/` directory
   - Delete `/app/api/bet-awards/create` (use `/api/sessions/create`)
   - Delete `/app/bet-awards/[pin]/` (use `/app/partyspace/[pin]/`)

5. **Update Documentation**
   - Update all references from "room" to "session"
   - Update all references from "bet-awards" to "partyspace"
   - Remove participant-related docs

## Testing the New Flow

```bash
# Start the dev server
npm run dev

# 1. Create a session
Visit: http://localhost:3000/bet-awards/create
- Register with email
- Create "My Party 2024"
- Get PIN (e.g., 1234)

# 2. Add nominees
Auto-redirected to: http://localhost:3000/partyspace/1234/settings
- Add nominees to each award
- Save settings

# 3. Join as player
Visit: http://localhost:3000/partyspace/1234
- Enter name "Alice"
- Join game

# 4. Vote
Visit: http://localhost:3000/partyspace/1234/play
- Vote on each category

# 5. View results
Visit: http://localhost:3000/partyspace/1234/results
- See pie charts and bar graphs
```

## Environment Variables

No changes needed - same JWT secret:
```
JWT_SECRET=your-secret-key-here
```

## Database Collections

```
users           // Hosts with email auth
gamesessions    // Game sessions with PINs
awards          // Awards linked to sessions
votes           // Anonymous votes
```

## Key Improvements

1. **Simplified Architecture** - From 4 models to 3 (removed Participant)
2. **Better UX** - No registration needed to play
3. **Cleaner Code** - Less complexity, easier to maintain
4. **Faster Joins** - Instant participation with just a name
5. **Anonymous Voting** - Privacy-friendly design
