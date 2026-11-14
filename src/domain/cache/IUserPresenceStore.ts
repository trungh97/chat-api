/** A user whose presence record currently says they are online. */
export type OnlineUserPresence = {
  userId: string;
  /** The user's last heartbeat, or `null` when the record has no readable time. */
  lastSeenAt: Date | null;
};

export interface IUserPresenceStore {
  /**
   * Finds every user whose presence record says they are online.
   *
   * @returns {Promise<OnlineUserPresence[]>} The online users with their last heartbeat time.
   */
  findOnlineUsers(): Promise<OnlineUserPresence[]>;

  /**
   * Marks a user offline. Their `lastSeenAt` is kept, so it still says when they were last here.
   *
   * @param {string} userId - The user to mark offline.
   */
  markOffline(userId: string): Promise<void>;
}
