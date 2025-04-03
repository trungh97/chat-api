import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves participant names by their IDs.
 */
export interface IGetParticipantsNamesByIdsUseCase {
  /**
   * Executes the get participant names by IDs use case.
   *
   * @async
   * @param {string[]} userIds - The IDs of the participants.
   * @returns {Promise<UseCaseResponse<string[]>>} The response data.
   */
  execute(userIds: string[]): Promise<UseCaseResponse<string[]>>;
}
