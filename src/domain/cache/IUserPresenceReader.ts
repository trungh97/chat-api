export interface IUserPresenceReader {
  /**
   * Reads the online status of several users at once.
   *
   * @param {string[]} userIds - The users to look up.
   * @returns {Promise<Record<string, boolean>>} Each user id mapped to whether it is online.
   * Users with no presence record are reported as offline.
   */
  getOnlineStatusByUserIds(userIds: string[]): Promise<Record<string, boolean>>;
}
