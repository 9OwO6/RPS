# RPS Tactical Duel

**A bilingual tactical Rock-Paper-Scissors duel game with local play, AI mode, online room-code multiplayer, animations, audio, and server-authoritative combat resolution.**

RPS Tactical Duel turns Rock-Paper-Scissors into a deterministic turn-based mind game: players read each other, charge attacks, counter at the right moment, punish repeated patterns, and manage stagger / lockout states. The project is built as a reusable TypeScript game engine with a polished Next.js UI and a separate Socket.IO realtime server.

> 中文简介：这是一个中英文双语的战术猜拳对战游戏，融合“石头 / 剪刀 / 布”的克制关系、蓄力、反制、僵直、在线房间码对战和武侠风格演出。

## Live Demo

- **Play online:** https://rps-beta-lyart.vercel.app/
- **Note:** The Socket.IO server is hosted on a free Render instance. The first online connection may take a few seconds if the server is asleep.

## Highlights

- **Local pass-and-play duel** with hidden first-player selection.
- **Player vs AI** with Easy / Normal difficulty and public-state-only decision making.
- **Online room-code multiplayer** using a separate Socket.IO server.
- **Hidden simultaneous action selection**: clients only see lock status before server resolution.
- **Server-authoritative combat**: online clients never calculate official match results.
- **Reconnect / seat reclaim** with localStorage player tokens for short disconnect recovery.
- **Chinese / English localization** with persisted language preference.
- **Tutorial system** explaining core mechanics step by step.
- **Combat clash animations**, selected-action focus effects, damage feedback, and game-over finisher animation.
- **BGM / SFX controls** with separate Music / SFX / Master toggles.
- **Vitest coverage** for game rules, AI behavior, room state sanitization, reconnect helpers, and server smoke checks.

## Gameplay System

The game keeps the familiar Rock-Paper-Scissors foundation but turns it into a tactical duel:

| Action | Tactical Role |
|---|---|
| **Scissors** | Fast pressure. Beats Paper and can stagger the opponent. Repeating Scissors can force a Rock release. |
| **Rock** | Pressure tool. Starts charging, then can release Lv1 / Lv2 attacks. |
| **Paper** | Counter tool. Punishes Rock release, but repeated Paper is locked out. |
| **Hold** | Continues Rock charge to build stronger threat. |

Core ideas:

- No random rolls.
- Both players lock actions before reveal.
- State matters: Normal, Charging Lv1, Charging Lv2, and Staggered.
- Repeated actions are punished or transformed.
- Reading the opponent matters more than luck.

## Online Multiplayer Architecture

Online Duel uses a separate Node.js + Socket.IO server. The browser client submits only the selected input action. The server owns the authoritative `GameState`, stores pending actions privately, calls `resolveRound`, then broadcasts the resolved public result to both clients.

```text
Browser Client
  | socket.io-client
  v
Next.js UI
  | submit_action / room events
  v
Node.js + Socket.IO Server
  | authoritative state
  v
TypeScript Game Engine: resolveRound
```

Key online safety decisions:

- Pending actions are never sent to the opponent before both players lock in.
- Public room state is sanitized before broadcasting.
- The server validates legal actions using authoritative player state.
- Reconnect uses a short-lived localStorage player token, not an account system.
- Rooms are in-memory for the MVP; server restart clears active rooms.

## Technical Highlights

- Designed a **deterministic TypeScript battle engine** centered around a reusable `resolveRound` flow.
- Built **local, AI, tutorial, and online modes** using the same core combat model.
- Implemented **server-authoritative multiplayer** with hidden pending actions and sanitized public room state.
- Added **AI decision logic** that uses only public `GameState`, avoiding hidden-action cheating.
- Built a lightweight **dictionary-based i18n system** for Chinese and English.
- Coordinated **animation, audio, and result state** without changing rule logic.
- Deployed the frontend and realtime server separately using **Vercel + Render**.

## Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

### Realtime Server

- Node.js
- Socket.IO
- In-memory room store for MVP multiplayer

### Testing

- Vitest
- Rule-engine tests
- AI behavior tests
- Online room state / reconnect helper tests
- Server smoke tests

### Deployment

- Vercel for the Next.js frontend
- Render for the Socket.IO server

## Local Development

Install dependencies:

```bash
npm install
npm --prefix server install
```

Run the frontend:

```bash
npm run dev
```

Run the Socket.IO server:

```bash
npm run dev:server
```

Local URLs:

```text
Frontend:      http://localhost:3000
Socket server: http://localhost:3001
```

## Environment Variables

### Frontend

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

For production, point it to the deployed Socket.IO server:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
```

### Socket Server

```env
CORS_ORIGIN=http://localhost:3000
ONLINE_SEAT_GRACE_MS=300000
```

For production, `CORS_ORIGIN` should include the Vercel frontend origin.

## Testing

Run all tests:

```bash
npm test
```

Run the server smoke test:

```bash
npm run smoke:server
```

Run production build:

```bash
npm run build
```

## Project Structure

```text
src/game/           Core combat engine, types, AI, tests
src/components/     Battle UI, online UI, tutorial, animation layers
src/i18n/           Chinese / English dictionary-based localization
src/online/         Online client types, socket client, session helpers
server/src/         Socket.IO server, rooms, public room state helpers
docs/               Design notes, deployment guide, local dev guide
```

## Screenshots / Showcase Assets

Recommended showcase assets to add later:

```text
public/showcase/hero.png
public/showcase/online-lobby.png
public/showcase/battle-selection.png
public/showcase/clash-animation.png
public/showcase/game-over-finisher.png
public/showcase/demo.gif
```

These files are optional and not required to run the project.

## Known Limitations

- Online rooms are stored in memory.
- Server restart clears active rooms and reconnect seats.
- Free Render hosting can sleep, so first online connection may be slow.
- Reconnect is localStorage-token based and not cross-device account recovery.
- No matchmaking, ranking, chat, accounts, or persistent match history yet.
- Mobile polish can still be improved.

## Roadmap

- Improve mobile battle layout and onboarding.
- Add stronger AI personalities / difficulty options.
- Add persistent match history and player profiles.
- Add matchmaking or public lobby mode.
- Continue balance tuning after more playtesting.
- Add more polished showcase screenshots / GIFs.

## Credits

External visual and audio assets should be tracked in `docs/ASSET_CREDITS.md`. If asset records are incomplete, update that file before using the project commercially or publicly beyond portfolio/testing use.

## Related Documentation

- [`docs/RPS_TACTICAL_DUEL_SPEC.md`](docs/RPS_TACTICAL_DUEL_SPEC.md)
- [`docs/ONLINE_LOCAL_DEV.md`](docs/ONLINE_LOCAL_DEV.md)
- [`docs/ONLINE_DEPLOYMENT_GUIDE.md`](docs/ONLINE_DEPLOYMENT_GUIDE.md)
