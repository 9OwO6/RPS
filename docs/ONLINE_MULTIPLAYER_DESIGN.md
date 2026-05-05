# Online Multiplayer Design (Phase 5A)

## 1) Scope

### MVP includes

- 2-player online duel via room code
- Create room
- Join room by code
- Assign `P1` / `P2`
- Waiting room before match start
- Hidden action submission (simultaneous lock-in)
- Server-authoritative `resolveRound`
- Broadcast round result to both clients
- Next round flow
- Game over flow
- Leave / disconnect warning

### MVP does not include

- Accounts / login / user profiles
- Matchmaking queue
- Ranking / ladder
- Chat
- Spectator mode
- Reconnect recovery
- Persistent match history
- Advanced anti-cheat (beyond server-authoritative hidden actions)

---

## 2) Recommended Architecture

### Frontend

- Keep existing Next.js app as the game client
- Add `socket.io-client` for realtime room communication
- Reuse current presentation systems (combat reveal, damage feedback, audio)

### Realtime server

- Separate Node.js + Socket.IO service
- In-memory room store for MVP
- Server stores authoritative online `GameState`
- Server is responsible for:
  - room lifecycle
  - action lock tracking
  - calling `resolveRound`
  - broadcasting synchronized updates

### Deployment

- Frontend can stay on Vercel
- Realtime server should be deployed separately (e.g. Railway / Render / Fly.io)
- Local development:
  - Frontend: `http://localhost:3000`
  - Realtime server: `http://localhost:3001`

---

## 3) Why Not Vercel Functions for WebSockets

Persistent WebSocket sessions are best handled by a dedicated realtime process. Serverless functions are optimized for short-lived request/response workloads, not long-lived bidirectional connections required by room-based realtime games.

---

## 4) Why Not Supabase Realtime for MVP

Supabase Realtime is possible, but for this MVP, Socket.IO is simpler for:

- strict server-authoritative match resolution
- hidden action lock-in logic
- explicit room lifecycle control
- direct control over event protocol and round sequencing

This keeps implementation focused and predictable for the first online version.

---

## 5) Room State Model (TypeScript-style)

```ts
type PlayerId = "P1" | "P2";
type OnlineRoomStatus = "WAITING" | "IN_GAME" | "GAME_OVER" | "CLOSED";

interface PlayerConnection {
  playerId: PlayerId;
  socketId: string;
  joinedAt: number;
  connected: boolean;
}

interface PendingActions {
  p1?: InputAction;
  p2?: InputAction;
  p1Locked: boolean;
  p2Locked: boolean;
}

interface ServerOnlineRoom {
  roomCode: string;
  players: Partial<Record<PlayerId, PlayerConnection>>;
  gameState: GameState;
  pendingActions: PendingActions;
  status: OnlineRoomStatus;
  createdAt: number;
  updatedAt: number;
}

interface PublicOnlineRoomState {
  roomCode: string;
  players: Partial<
    Record<
      PlayerId,
      {
        playerId: PlayerId;
        connected: boolean;
      }
    >
  >;
  gameState: GameState;
  status: OnlineRoomStatus;
  p1Locked: boolean;
  p2Locked: boolean;
  createdAt: number;
  updatedAt: number;
}
```

Notes:

- `gameState` is authoritative on server.
- `pendingActions` must be cleared immediately after resolve.
- `updatedAt` should change on every room mutation.
- `ServerOnlineRoom` is internal server state and is never emitted directly.
- All client-facing room payloads must use `PublicOnlineRoomState`.
- `PublicOnlineRoomState` must **not** contain `pendingActions.p1` / `pendingActions.p2`.

---

## 6) Socket Event Design

### Client -> Server

#### `create_room`

- Payload:
  - `{ requestedBy: string }` (or empty in MVP)
- Server behavior:
  - generate unique `roomCode`
  - create room with caller as `P1`
  - initialize `gameState`
- Client behavior:
  - transition to waiting room on success

#### `join_room`

- Payload:
  - `{ roomCode: string }`
- Server behavior:
  - validate room exists and has free seat
  - assign `P2`
  - set room status to `IN_GAME` once both players present
- Client behavior:
  - show room/join state, handle errors cleanly

#### `submit_action`

- Payload:
  - `{ roomCode: string; action: InputAction }`
- Server behavior:
  - verify sender belongs to room
  - verify room in playable state
  - validate action against sender state
  - store privately in `pendingActions`
  - broadcast lock status only
  - when both actions present: call `resolveRound`, clear pending, broadcast result
- Client behavior:
  - show own locked state
  - wait for `round_resolved`

#### `next_round`

- Payload:
  - `{ roomCode: string }`
- Server behavior:
  - verify both players ready and room state allows transition
  - transition authoritative `gameState` phase to next pick phase
- Client behavior:
  - sync to server room state

#### `restart_match`

- Payload:
  - `{ roomCode: string }`
- Server behavior:
  - reset room to initial authoritative game state
  - clear pending actions
  - broadcast restart
- Client behavior:
  - reset presentation state and replay guards

#### `leave_room`

- Payload:
  - `{ roomCode: string }`
- Server behavior:
  - remove/disconnect player from room
  - notify remaining player
  - close room if empty
- Client behavior:
  - return to online lobby/start flow

### Server -> Client

#### `room_created`

- Payload:
  - `{ roomCode: string; playerId: "P1"; roomState: PublicOnlineRoomState }`
- Purpose:
  - creator gets room details and role

#### `room_joined`

- Payload:
  - `{ roomCode: string; playerId: "P2"; roomState: PublicOnlineRoomState }`
- Purpose:
  - joining player gets room details and role

#### `room_state`

- Payload:
  - `{ roomState: PublicOnlineRoomState }`
- Purpose:
  - full sync snapshot after important transitions

#### `player_joined`

- Payload:
  - `{ roomCode: string; playerId: "P2" }`
- Purpose:
  - notify waiting player match is ready

#### `player_left`

- Payload:
  - `{ roomCode: string; playerId: PlayerId; reason?: string }`
- Purpose:
  - show disconnect/leave warning

#### `action_locked`

- Payload:
  - `{ roomCode: string; p1Locked: boolean; p2Locked: boolean }`
- Purpose:
  - communicate lock progress without revealing actions

#### `round_resolved`

- Payload:
  - `{ roomCode: string; gameState: GameState }`
- Purpose:
  - synchronized reveal/update for both clients

#### `match_restarted`

- Payload:
  - `{ roomCode: string; gameState: GameState }`
- Purpose:
  - synchronized fresh match state

#### `error_message`

- Payload:
  - `{ code: string; message: string }`
- Purpose:
  - controlled user-facing failure handling

---

## 7) Hidden Action Safety

- Server receives each action privately.
- Server does **not** broadcast raw actions before both players lock in.
- Only lock flags (`p1Locked` / `p2Locked`) are broadcast pre-resolve.
- Official online result is resolved on server only.
- Clients must never compute authoritative online match outcomes.

---

## 8) Online Round Flow

1. Both players see same authoritative `gameState` snapshot.
2. P1 selects and submits action.
3. P2 selects and submits action.
4. Server stores pending actions privately.
5. Server broadcasts `action_locked` status (no action contents).
6. When both actions exist:
   - server validates both
   - server calls `resolveRound`
   - server clears `pendingActions`
   - server broadcasts `round_resolved` with authoritative result
7. Clients render existing reveal/feedback/audio from server result.
8. Next round request transitions room to next pick phase.

---

## 9) Disconnect Handling (MVP)

- If one player disconnects:
  - server emits `player_left` to remaining player
  - client shows: `Opponent disconnected.`
- Room behavior (MVP simple option):
  - keep room for short grace window (or close immediately)
  - no full reconnect identity recovery yet

---

## 10) Security / Cheating Notes

### MVP security baseline

- Server-authoritative room state
- Validate sender belongs to room/seat (`P1` or `P2`)
- Validate submitted action legality against authoritative player state
- Never trust client-side `GameState`
- Never reveal pending actions early

### Not in MVP

- Full account auth
- Cryptographic commit-reveal
- Ranked anti-cheat system
- Reconnect identity/session recovery

---

## 11) Proposed File Structure

### Frontend

- `src/online/onlineTypes.ts`
- `src/online/socketClient.ts`
- `src/components/OnlineLobbyScreen.tsx`
- `src/components/OnlineBattleScreen.tsx`

### Server

- `server/package.json`
- `server/tsconfig.json`
- `server/src/index.ts`
- `server/src/rooms.ts`
- `server/src/onlineTypes.ts`

Note:

- Early stage can import shared game logic from existing `src/game`.
- If import boundaries become painful, extract to `packages/game-core` later.

---

## 12) Development Phases

- **Phase 5A**: design document only
- **Phase 5B**: local Socket.IO server + create/join room + basic room state
- **Phase 5C**: hidden action submit + server `resolveRound` + online battle UI
- **Phase 5D**: deployment + env vars + CORS hardening
- **Phase 5E**: reconnect/polish/ready-state improvements

---

## 13) Risks

- Shared code import boundaries between frontend and server
- Dedicated Socket server deployment complexity
- CORS and environment misconfiguration
- State sync bugs between client/server snapshots
- Double submit / race conditions
- Disconnect edge cases
- Mobile browser connection behavior
- Audio autoplay policy differences across browsers

---

## 14) First Implementation Plan (Recommended Next Step)

Start with transport and room skeleton only:

1. Create local Socket.IO server project scaffold.
2. Implement `create_room` + `join_room` only.
3. No combat/resolve in this step.
4. Verify two browser windows can connect to same room and receive role/state updates.

Then proceed to hidden action submission in Phase 5C.
