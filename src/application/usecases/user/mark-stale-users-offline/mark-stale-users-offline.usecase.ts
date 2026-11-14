import { MarkStaleUsersOfflineRequest } from "./mark-stale-users-offline.request";
import { MarkStaleUsersOfflineResponse } from "./mark-stale-users-offline.response";

/**
 * Interface for the MarkStaleUsersOfflineUseCase.
 */
export interface IMarkStaleUsersOfflineUseCase {
  /**
   * Marks online users whose heartbeat stopped as offline and publishes an offline event for
   * each. This catches users who left without a clean WebSocket disconnect.
   *
   * @param {MarkStaleUsersOfflineRequest} request - The offline threshold.
   * @returns {Promise<MarkStaleUsersOfflineResponse>} The number of users marked offline.
   */
  execute(
    request: MarkStaleUsersOfflineRequest
  ): Promise<MarkStaleUsersOfflineResponse>;
}
