/**
 * Presence timings, in seconds. They must keep this relationship:
 *
 *   PRESENCE_HEARTBEAT_INTERVAL_SECONDS < PRESENCE_OFFLINE_THRESHOLD_SECONDS
 *   PRESENCE_OFFLINE_THRESHOLD_SECONDS + PRESENCE_CLEANUP_INTERVAL_SECONDS < PRESENCE_TTL_SECONDS
 *
 * The first keeps a user who heartbeats normally online. The second makes sure the cleanup job
 * sees a stale key before Redis expires it, so an offline event is always published.
 *
 * A user who leaves without a clean WebSocket disconnect is shown offline within at most
 * PRESENCE_OFFLINE_THRESHOLD_SECONDS + PRESENCE_CLEANUP_INTERVAL_SECONDS (120s).
 */

/** How often the client sends a heartbeat. The client owns this value; keep the two in step. */
export const PRESENCE_HEARTBEAT_INTERVAL_SECONDS = 30;

/** A user with no heartbeat for this long is treated as offline. Tolerates two missed heartbeats. */
export const PRESENCE_OFFLINE_THRESHOLD_SECONDS = 90;

/** How often the cleanup job looks for users past the offline threshold. */
export const PRESENCE_CLEANUP_INTERVAL_SECONDS = 30;

/** Lifetime of a presence hash, refreshed on every presence write. */
export const PRESENCE_TTL_SECONDS = 180;

/** Redis key prefix of the per-user presence hash. Build keys with `userPresenceKey`. */
export const USER_PRESENCE_KEY_PREFIX = "user-presence:";

/** The Redis key of a user's presence hash, e.g. `user-presence:<userId>`. */
export const userPresenceKey = (userId: string): string =>
  `${USER_PRESENCE_KEY_PREFIX}${userId}`;
