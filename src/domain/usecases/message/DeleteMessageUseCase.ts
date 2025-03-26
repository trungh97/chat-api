import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that deletes a message.
 */
export interface IDeleteMessageUseCase {
  /**
   * Executes the delete message use case.
   *
   * @async
   * @param {string} id - The ID of the message to delete.
   * @returns {Promise<UseCaseResponse<boolean>>} The response data.
   */
  execute(id: string): Promise<UseCaseResponse<boolean>>;
}
