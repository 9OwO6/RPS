# Online multiplayer — local development

This project’s online MVP uses a **Next.js** frontend and a small **Socket.IO** server in `server/`.

## Run the frontend

From the repository root:

```bash
npm install
npm run dev
```

Default URL: `http://localhost:3000`.

Optional — point the browser at a non-default socket server:

```bash
set NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
npm run dev
```

(On Unix-like shells, use `export NEXT_PUBLIC_SOCKET_URL=...`.)

## Run the socket server

From the repository root:

```bash
npm run dev:server
```

Or from `server/`:

```bash
npm install
npm run dev
```

(`server/`’s `dev` script forwards to the repo-root `dev:server`, which starts from `socket-server.ts` — see reconnect notes below.)

### Environment variables (server)

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `PORT` | `3001` | HTTP port for Socket.IO |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed browser origin for handshakes |
| `FRONTEND_ORIGIN` | _(unused if `CORS_ORIGIN` set)_ | Legacy alias for the same setting |
| `ONLINE_SEAT_GRACE_MS` | `300000` (5m) | After a **disconnect** (not intentional leave), how long a P1/P2 seat stays reserved before it can be freed for a new `join_room`. Minimum enforced internally is 60s. |
| `ROOM_IDLE_PURGE_MS` | `7200000` (2h) | Sweep deletes entire rooms that have **no connected players** and have been idle longer than this |
| `ROOM_SWEEP_INTERVAL_MS` | `300000` (5m) | How often to run the purge sweep |
| `DEBUG_ROOM_SWEEP` | _(unset)_ | Set to `1` to log purge counts |
| `DEBUG_ONLINE_NEXT_ROUND` | _(unset)_ | Set to `1` for verbose next-round logs |

On startup the process prints the actual listen URL and CORS allowlist, for example:

`Socket server listening on http://localhost:3001 (CORS allow: http://localhost:3000)`

## Common error: `EADDRINUSE`

If port **3001** is already taken, you’ll see:

`Port 3001 is already in use. Stop the existing server or run with PORT=3002.`

Either stop the other process or pick another port, e.g.:

```bash
set PORT=3002
npm run dev:server
```

…and set `NEXT_PUBLIC_SOCKET_URL` on the frontend to match.

## Test with two browser windows

1. Start frontend (`npm run dev`) and socket server (`npm run dev:server`).
2. Open **two** browser windows (or one normal + one private) at `http://localhost:3000`.
3. Both: **Online Duel** → **Create Room** / **Join** with the code.
4. When both are in the room, each clicks **Enter Online Duel**.
5. Confirm picks stay hidden until the server resolves the round; disconnect one tab and confirm the other shows **Opponent disconnected / waiting for reconnect.**
6. (Reconnect) After disconnecting or refreshing one window, open **Online Duel** again and use **Rejoin Last Room** so that seat is reclaimed without resetting HP.

## Reconnect & seat reclaim (Phase 5D.1)

This MVP uses **no accounts**. Reconnect is **seat reclaim** via a server-issued secret plus browser **localStorage**, not login.

### How “Rejoin Last Room” works

1. After you **create** or **join** a room successfully, the server sends you a **`playerToken`** (only to your socket) together with `room_created`, `room_joined`, or `room_rejoined`.
2. The client saves **`rps-online-session`** in **localStorage** (see below).
3. If you return to the **Online Lobby** and that entry still exists, you’ll see **Rejoin Last Room** with the last room code and seat (P1 or P2).
4. Clicking it emits **`rejoin_room`** `{ roomCode, playerId, playerToken }` to the socket server.
5. If the token matches the seat still stored server-side, the server attaches your **current** `socket.id` to that seat, sets **`connected: true`**, clears the disconnect timestamp, joins the Socket.IO room, sends **`room_rejoined`** to you (includes token again for storage), and broadcasts **`room_state`** so both clients refresh UI.
6. If the token is wrong or the seat was removed (expired grace / intentional leave), you get **`error_message`** with code **`REJOIN_FAILED`** and the client clears stale **localStorage**.

Strangers cannot take a **disconnected** seat with **`join_room`** alone — they receive **`SEAT_RESERVED`** until the grace period frees that seat or the original holder uses **`rejoin_room`** with the correct token.

### What is stored in localStorage (`rps-online-session`)

Single key: **`rps-online-session`**.

Value: JSON object:

```json
{
  "roomCode": "ABC12",
  "playerId": "P1",
  "playerToken": "<opaque string from server>"
}
```

- **`roomCode`** — uppercase room id.
- **`playerId`** — **`"P1"`** or **`"P2"`** — which seat you claimed.
- **`playerToken`** — opaque reconnect credential for that seat only.

**Not stored:** selected maneuvers, pending picks, or any hidden duel inputs.

### What `playerToken` is used for

- Proves to the server that this browser is allowed to **reclaim the same P1 or P2 seat** after a new socket connection (refresh, tab crash, network blip).
- **Never** appears in public **`room_state`** payloads sent to everyone.
- **Never** intentionally sent to the opponent; only to your client in **`room_created`**, **`room_joined`**, and **`room_rejoined`**.

### Accidental disconnect / refresh

- The server marks your seat **`connected: false`**, clears **`socketId`**, sets **`disconnectedAt`**, and keeps **HP / `gameState` / locks** as they were (no match reset from disconnect alone).
- **`rps-online-session` is not cleared** on socket disconnect — so you can come back and **Rejoin Last Room**.
- The other player sees that your seat is disconnected until you reconnect successfully.
- Socket.IO may reconnect the transport automatically; you still need to click **Rejoin Last Room** to reclaim your seat on the server.

### Intentional leave / Back to Start

Actions such as **Leave Room**, **Back to Start**, or **Back to Online Lobby** (when leaving the current match):

- The client emits **`leave_room`** and clears **`rps-online-session`**.
- The server **removes that seat** (not reconnectable with the old token).
- This is **not** the same as a transient disconnect; do not expect reclaim after you intentionally leave.

### `ONLINE_SEAT_GRACE_MS`

Server-side milliseconds (default **300000** = 5 minutes). While a seat is disconnected but **within** this grace window:

- The original player can **`rejoin_room`** with the saved **`playerToken`**.
- A random **`join_room`** cannot occupy that seat (**`SEAT_RESERVED`**).

After grace (and on sweep), a disconnected seat may be removed so a **new** player can **`join_room`** as P2 when the slot is empty — behavior stays MVP-simple.

## Optional smoke check (server)

Does not start the HTTP listener; runs a tiny Vitest file that imports room helpers:

```bash
npm run smoke:server
```

## Current online limitations (MVP)

- **No account system** — identity is “who holds the seat + token on this browser.”
- **No cross-device recovery** — token is only in **localStorage** on this origin/profile; another machine or browser profile cannot reclaim without copying secrets manually (not supported).
- **localStorage token only** — not encrypted; anyone with access to the browser profile could read it; treat as a dev/MVP convenience.
- **Room state lives in server memory** — not durable across horizontal scale.
- **Server restart clears all rooms** — all seats and in-memory duel state are lost; saved **`rps-online-session`** then usually yields **`REJOIN_FAILED`** until you create/join a new room.
- **Reconnect requires clicking “Rejoin Last Room”** — automatic reclaim without user action is not implemented.
- No database, no matchmaking or rankings.
- No chat.
- Invalid join / missing room / reserved seat errors surface via **`error_message`** in the lobby UI.
