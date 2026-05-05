# Online deployment guide (Phase 5E)

This document prepares **manual** deployment of:

| Piece | Suggested host |
| ----- | --------------- |
| Next.js frontend | **Vercel** |
| Socket.IO server | **Render**, **Koyeb**, **Railway**, or any **Node** process that exposes **HTTP + WebSocket** |

There is **no automated deploy** in this repo — configure hosts yourself after review.

---

## Architecture recap

```
Browser (Vercel, HTTPS)
    │
    │  HTTPS pages + static assets
    ▼
Next.js app

Browser  ──WebSocket / polling──►  Socket.IO server (Node)
                                      │
                                      └── In-memory rooms, game state,
                                          reconnect tokens (no DB)
```

- The **browser never talks to Socket.IO through Vercel’s serverless routes** in this MVP; it connects **directly** to `NEXT_PUBLIC_SOCKET_URL`.
- **CORS** on the Socket server must allow your **exact** Vercel origin(s).

---

## Frontend: deploy to Vercel

1. Connect the Git repo and select the Next.js app root (this repository).
2. **Framework preset**: Next.js defaults are fine.
3. **Environment variables** (Production — and Preview if you test previews):

   | Name | Example | Notes |
   | ---- | ------- | ----- |
   | `NEXT_PUBLIC_SOCKET_URL` | `https://your-service.onrender.com` | **Public**; must match deployed Socket URL (scheme + host, no trailing slash). |

   Local development without setting this variable defaults to **`http://localhost:3001`** (see `src/online/socketClient.ts`).

4. Deploy. Note your production URL, e.g. `https://your-app.vercel.app`.

---

## Socket.IO server: Render / Koyeb / Railway-style Node service

### Repository layout

The runnable entry is at the **repository root**: `socket-server.ts` preloads shared game modules before `server/src/index.ts` (tsx + `socket.io` load order).  

Use **repo root** as the service **root directory**, not only `server/`.

### Install

Ensure both installs run so `server/node_modules` includes `socket.io`:

```bash
npm install
npm install --prefix server
```

(On many PaaS dashboards, use an install script or a single root `npm install` if your layout hoists deps; if `socket.io` resolves missing at runtime, keep `npm install --prefix server`.)

### Start command

From repo root:

```bash
npm run start:server
```

Equivalent: `npx tsx ./socket-server.ts`

### Listen address

- **`PORT`**: set by the platform (required on Render/Railway/etc.). Parsed in `server/src/index.ts`; invalid values fall back to **3001** with a warning.
- **`HOST`**: optional; default **`0.0.0.0`** so the process accepts external connections in containers. Override only if your provider documents a specific bind address.

### Required environment variables

| Variable | Required | Example | Purpose |
| -------- | -------- | ------- | ------- |
| `PORT` | Usually **set by host** | `10000` | HTTP port for Socket.IO |
| `CORS_ORIGIN` | **Yes** (production) | See below | Browser origins allowed to open Socket.IO handshakes |
| `ONLINE_SEAT_GRACE_MS` | No | `300000` | Disconnect seat reclaim window (default 5 minutes); purge uses `max(60000, value)` |
| `ROOM_IDLE_PURGE_MS` | No | `7200000` | Whole-room idle purge when nobody is connected |
| `ROOM_SWEEP_INTERVAL_MS` | No | `300000` | Sweep interval |
| `HOST` | No | `0.0.0.0` | Bind address (default already suitable for PaaS) |

**`CORS_ORIGIN` examples**

- Local Next.js:  
  `CORS_ORIGIN=http://localhost:3000`
- Production Vercel app:  
  `CORS_ORIGIN=https://your-app.vercel.app`
- Multiple origins (comma-separated, no spaces required but trims supported):  
  `CORS_ORIGIN=https://your-app.vercel.app,https://preview-branch.vercel.app`

Legacy alias: `FRONTEND_ORIGIN` is still read if `CORS_ORIGIN` is unset.

### Startup logs

On boot you should see lines similar to:

- `[socket] Listening on http://0.0.0.0:<PORT> ...`
- `[socket] CORS origin(s): ...`
- `[socket] Seat reclaim grace ONLINE_SEAT_GRACE_MS=...`

Use these to confirm env wiring before debugging clients.

---

## Local vs production URLs

| Environment | Frontend | `NEXT_PUBLIC_SOCKET_URL` | Socket `CORS_ORIGIN` |
| ----------- | -------- | -------------------------- | --------------------- |
| Local | `http://localhost:3000` | unset → `http://localhost:3001` | `http://localhost:3000` |
| Production | `https://<vercel-domain>` | `https://<socket-host>` | `https://<vercel-domain>` (match exactly) |

---

## Common problems

### CORS error in the browser

- **Symptom**: Preflight or handshake blocked; console mentions CORS.
- **Fix**: Set **`CORS_ORIGIN`** on the Socket server to the **exact** frontend origin (scheme + host, no path). Include **preview** URLs if you test Vercel previews.

### WebSocket connection failed

- **Symptom**: `websocket error`, falling back to polling, or permanent disconnect.
- **Checks**:
  - `NEXT_PUBLIC_SOCKET_URL` must point to the **public** URL of the Socket service (correct host/port/path — typically **no path**).
  - Free tiers may idle-sleep; first connection can wake the dyno (**cold start**).
  - Corporate networks / mixed firewall rules blocking WebSockets.

### Server sleeping (free hosting)

- **Symptom**: First load stalls ~30–60s then works.
- **Cause**: Free tiers spin down idle processes.
- **Mitigation**: Upgrade tier, or accept cold starts for MVP testing.

### Wrong `NEXT_PUBLIC_SOCKET_URL`

- **Symptom**: Lobby shows connection errors or wrong environment.
- **Fix**: Redeploy frontend after changing env vars; Vercel bakes `NEXT_PUBLIC_*` at **build** time.

### HTTPS frontend + HTTP socket (mixed content)

- **Symptom**: Browser blocks **insecure** connections from an **HTTPS** page.
- **Fix**: Serve Socket.IO over **HTTPS** (TLS) with a valid certificate — typical on Render/Railway public URLs. Use **`https://`** in `NEXT_PUBLIC_SOCKET_URL`.

### Port already in use (local)

- See `docs/ONLINE_LOCAL_DEV.md` — use another `PORT` or stop the conflicting process.

### Server restart clears rooms

- **Expected**: All duel state and reconnect tokens live **in memory**. Any deploy, crash, or restart **drops every room**.

---

## Production test checklist

After both frontend and Socket server are deployed:

- [ ] Open the **deployed** frontend in **two separate browsers** (or normal + private window).
- [ ] **Online Duel** → **Create room** / **Join** with code.
- [ ] **Enter Online Duel** from both sides.
- [ ] **Submit actions** — picks stay **hidden** from opponent until resolve.
- [ ] Confirm **server resolves** round and UI updates (damage / logs).
- [ ] **Next round** / ready flow works.
- [ ] Disconnect one tab — other side shows **opponent disconnected / waiting for reconnect**.
- [ ] **Rejoin Last Room** restores seat without wiping HP (same browser profile / `localStorage`).
- [ ] **BGM / SFX** still play as in local (browser autoplay rules may differ on first interaction).

---

## `server/package.json` scripts

- **`npm run start`** (inside `server/`) delegates to the repo root **`npm run start:server`** so production hosts can document either entrypoint.
- Root **`package.json`**:  
  - `dev:server` — local dev  
  - `start:server` — production-style run (`tsx ./socket-server.ts`)

---

## Known limitations (unchanged by deployment)

- No accounts, database, matchmaking, ranking, or chat.
- **Single** Socket process — horizontal scaling would require sticky sessions + shared state (out of scope).
- **Reconnect** requires clicking **Rejoin Last Room**; tokens are **localStorage-only** on one browser profile.
- See also **`docs/ONLINE_LOCAL_DEV.md`** for local workflows and reconnect behaviour.

---

## Related docs

- [`docs/ONLINE_LOCAL_DEV.md`](./ONLINE_LOCAL_DEV.md) — local dev, env vars, reconnect & `rps-online-session`
