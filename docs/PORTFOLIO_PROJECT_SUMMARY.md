# Portfolio Project Summary — RPS Tactical Duel

## 3-Sentence Summary

RPS Tactical Duel is a bilingual tactical duel web game that expands Rock-Paper-Scissors into a deterministic turn-based combat system with charging, counters, lockouts, stagger states, AI play, and online room-code multiplayer. The project includes a reusable TypeScript rule engine, a Next.js battle UI, a separate Socket.IO realtime server, Chinese / English localization, combat animations, audio controls, and Vercel + Render deployment. It is designed as a portfolio project demonstrating full-stack implementation, real-time multiplayer architecture, gameplay systems design, and production-style polish.

## Technical Summary

- Built a deterministic TypeScript combat engine with reusable `GameState`, `PlayerSnapshot`, legal-action validation, and `resolveRound` logic.
- Implemented local pass-and-play, Player vs AI, tutorial drills, and online 1v1 room-code multiplayer using the same core rule model.
- Built a separate Node.js + Socket.IO server with in-memory rooms, private pending actions, sanitized public room state, server-authoritative resolution, and reconnect / seat reclaim via player tokens.
- Added a lightweight dictionary-based i18n system for Chinese and English.
- Added combat clash animations, selected-action focus effects, game-over finisher animation, BGM / SFX controls, and localized online error handling.
- Deployed the frontend to Vercel and the realtime Socket.IO server to Render.

## Resume Bullets

- Built and deployed a bilingual tactical duel web game using Next.js, React, TypeScript, Tailwind CSS, Node.js, and Socket.IO, supporting local play, AI mode, and online room-code multiplayer.

- Designed a deterministic TypeScript combat engine with hidden simultaneous action selection, state-driven charging, counter mechanics, stagger effects, action lockouts, and Vitest test coverage.

- Implemented server-authoritative multiplayer with private pending actions, sanitized public room state, legal-action validation, and reconnect seat reclaim through player tokens.

- Created a Chinese / English localization system, tutorial flow, animated combat resolution, selected-action focus effects, audio controls, and game-over finisher animation to improve onboarding and game feel.

- Deployed a split architecture using Vercel for the Next.js frontend and Render for the Socket.IO server, including CORS / environment variable configuration and online smoke testing.

## Interview Talking Points

### 1. Why this project matters

This project is not a simple UI clone or tutorial app. It combines gameplay design, frontend UI state, animation timing, real-time networking, server authority, testing, localization, and deployment into one coherent system.

### 2. Rule engine design

The combat system is deterministic. Instead of relying on random rolls, each round is resolved from player state and selected actions. This makes the rule engine testable and reusable across local play, AI play, tutorial drills, and online multiplayer.

### 3. Online multiplayer architecture

Online mode uses a separate Socket.IO server. Clients submit selected actions, but the server stores pending actions privately and only broadcasts lock status until both players have locked in. The server calls `resolveRound` and broadcasts the authoritative result, which prevents clients from calculating or manipulating the official match result.

### 4. Hidden action safety

A key challenge was avoiding early action leaks. The public room state intentionally excludes raw pending actions and player tokens. Clients only receive `p1Locked` / `p2Locked` before resolution.

### 5. Reconnect design

The project supports lightweight reconnect through localStorage session data and server-side player tokens. This allows a player to reclaim the same P1 / P2 seat after refresh or short disconnect without needing a full account system.

### 6. UI / animation polish

The project includes selected-action focus effects, clash animations, damage feedback, and game-over finisher animation. These effects are presentation-only and use already-resolved game state rather than recalculating rules in the UI.

### 7. Localization

The game supports Chinese and English through a lightweight dictionary system. Chinese is useful for testers and friends; English remains useful for portfolio and hiring review.

## Challenges Solved

- Keeping local, AI, tutorial, and online modes aligned with one shared game engine.
- Preventing online hidden-action leaks before both players lock in.
- Designing server-authoritative room state while preserving responsive client UI.
- Handling disconnect and reconnect without accounts or a database.
- Balancing visual polish with maintainable React / CSS implementation.
- Making the project bilingual without hardcoding text across components.
- Deploying a split Vercel + Render architecture with correct CORS and environment variables.

## What I Learned

- How to model game rules as deterministic, testable TypeScript state transitions.
- How to separate authoritative server logic from client presentation logic.
- How to build a minimal but useful real-time multiplayer system with Socket.IO.
- How to sanitize server state before sending it to clients.
- How to handle reconnect flows without overbuilding accounts or persistence.
- How to coordinate animation, sound, and UI state without changing core business logic.
- How to prepare a personal project for portfolio use, not just local development.

## Suggested Short Portfolio Description

RPS Tactical Duel is a bilingual online tactical duel game built with Next.js, TypeScript, Tailwind CSS, Node.js, and Socket.IO. It features a deterministic combat engine, AI mode, online room-code multiplayer, server-authoritative hidden action resolution, reconnect support, localization, animations, and Vercel + Render deployment.

## Suggested LinkedIn Project Description

I built and deployed RPS Tactical Duel, a bilingual tactical duel web game that expands Rock-Paper-Scissors into a deterministic turn-based combat system. The project includes local play, AI mode, online room-code multiplayer, server-authoritative hidden action resolution, reconnect support, Chinese / English localization, combat animations, audio settings, and a split Vercel + Render deployment.

Technologies used: Next.js, React, TypeScript, Tailwind CSS, Node.js, Socket.IO, Vitest, Vercel, Render.
