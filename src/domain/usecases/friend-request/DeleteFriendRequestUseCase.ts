import { RepositoryResponse } from "@shared/responses";

/**
 * Interface for the DeleteFriendRequestUseCase.
 */
export interface IDeleteFriendRequestUseCase {
  /**
   * Executes the use case.
   *
   * @param {string} id - The friend request id.
   * @returns {Promise<RepositoryResponse<boolean, Error>>} The response object.
   */
  execute(id: string): Promise<RepositoryResponse<boolean, Error>>;
}
