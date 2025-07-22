import { DeleteExpiredFriendRequestsResponse } from "./delete-expired-friend-requests.response";

/**
 * Interface for the DeleteExpiredFriendRequestsUseCase.
 */
export interface IDeleteExpiredFriendRequestsUseCase {
  /**
   * Executes the use case.
   *
   * @param {number} days - The number of days to look back.
   * @returns {Promise<DeleteExpiredFriendRequestsResponse>} The response object.
   */
  execute(days: number): Promise<DeleteExpiredFriendRequestsResponse>;
}
