import { FriendRequestStatus } from "@domain/enums";
import { FriendRequest, User } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

/**
 * Interface for the ChangeFriendRequestStatusUseCase.
 */
export interface IChangeFriendRequestStatusUseCase {
  /**
   * Executes the use case.
   *
   * @param {string} id - The friend request id.
   * @param {FriendRequestStatus} status - The new status.
   * @param {User["id"]} currentUserId - The current user id.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The response object.
   */
  execute(
    id: string,
    status: FriendRequestStatus,
    currentUserId: User["id"]
  ): Promise<RepositoryResponse<FriendRequest, Error>>;
}
