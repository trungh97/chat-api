import { FriendRequest } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

/**
 * Interface for the GetFriendRequestByIdUseCase.
 */
export interface IGetFriendRequestByIdUseCase {
  /**
   * Executes the use case.
   *
   * @param {string} id - The friend request id.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The response object.
   */
  execute(id: string): Promise<RepositoryResponse<FriendRequest, Error>>;
}
