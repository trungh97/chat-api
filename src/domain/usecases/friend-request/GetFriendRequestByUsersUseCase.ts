import { FriendRequest } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

/**
 * Interface for the GetFriendRequestByUsersUseCase.
 */
export interface IGetFriendRequestByUsersUseCase {
  /**
   * Executes the use case.
   *
   * @param {string} senderId - The sender id.
   * @param {string} receiverId - The receiver id.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The response object.
   */
  execute(
    senderId: string,
    receiverId: string
  ): Promise<RepositoryResponse<FriendRequest, Error>>;
}
