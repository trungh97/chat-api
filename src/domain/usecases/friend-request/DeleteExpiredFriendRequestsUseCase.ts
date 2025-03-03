import { RepositoryResponse } from "@shared/responses";

/**
 * Interface for the FindExpiredFriendRequestsUseCase.
 */
export interface IDeleteExpiredFriendRequestsUseCase {
  /**
   * Executes the use case.
   *
   * @param {number} days - The number of days to look back.
   * @returns {Promise<RepositoryResponse<void, Error>>} The response object.
   */
  execute(days: number): Promise<RepositoryResponse<void, Error>>;
}
