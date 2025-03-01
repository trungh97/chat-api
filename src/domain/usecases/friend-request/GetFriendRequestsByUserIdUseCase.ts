import { FriendRequest } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

/**
 * Interface for the GetFriendRequestsByUserIdUseCase.
 */
export interface IGetFriendRequestsByUserIdUseCase {
  /**
   * Executes the use case.
   *
   * @param {string} userId - The user id.
   * @returns {Promise<RepositoryResponse<FriendRequest[], Error>>} The response object.
   */
  execute(userId: string): Promise<RepositoryResponse<FriendRequest[], Error>>;
}
