/**
 * Socket.IO server entry must run from the repo root (`npm run dev:server`).
 * This guarantees shared game modules load before socket.io under tsx (see Phase 5D notes).
 */
import "./server/src/rooms.ts";
import "./server/src/index.ts";
