# RPS Tactical Duel

A tactical twist on Rock–Paper–Scissors: synchronized turns, hidden choices, no random rolls, state-driven charging, paper counters, scissors pressure, staggers, and streak-based penalties — built as an extensible rules engine plus a browser UI.

**Current status:** Phase 2 complete — **local pass-and-play MVP** (two players on one device, hidden P1 pick → pass overlay → resolve via the shared rule engine).

## Tech stack

- **Next.js** (App Router)
- **React** & **TypeScript**
- **Tailwind CSS**
- **Vitest** — unit tests for the rule engine (`resolveRound`)

## Install

```bash
npm install
```

## Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

Runs `src/**/*.test.ts` (Vitest, Node environment):

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Production build

```bash
npm run build
npm start
```

## Current features

- **Pure TypeScript battle rules** (`src/game/resolveRound.ts`) — deterministic, reusable, covered by Vitest.
- **Local two-player UI** — round flow, HP, player states, paper/scissors streaks, legal actions via `actionAvailability`, battle log, next round / restart.
- **Pass-device overlay** so Player 2 does not see Player 1’s selection before confirming.
- **Game over** handling for winner, loser, or draw (per engine).

## Planned features

- UI polish (layout, clarity, accessibility, mobile tuning).
- **AI opponent** (policy using only public information).
- **Online room-code multiplayer** (authoritative server, hidden commits until both ready).

Specification: [`docs/RPS_TACTICAL_DUEL_SPEC.md`](docs/RPS_TACTICAL_DUEL_SPEC.md).
