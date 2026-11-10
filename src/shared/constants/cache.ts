export const DEFAULT_TTL = 200;

/** Redis key prefix of the per-user presence hash. Build keys with `userPresenceKey`. */
export const USER_PRESENCE_KEY_PREFIX = "user-presence:";

/** The Redis key of a user's presence hash, e.g. `user-presence:<userId>`. */
export const userPresenceKey = (userId: string): string =>
  `${USER_PRESENCE_KEY_PREFIX}${userId}`;
