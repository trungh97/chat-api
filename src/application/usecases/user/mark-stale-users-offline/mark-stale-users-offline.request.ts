export type MarkStaleUsersOfflineRequest = {
  /** An online user with no heartbeat for longer than this is marked offline. */
  thresholdSeconds: number;
};
