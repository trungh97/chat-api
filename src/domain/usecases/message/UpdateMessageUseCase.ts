import { Message } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that updates a message.
 */
export interface IUpdateMessageUseCase {
  /**
   * Executes the update message use case.
   *
   * @async
   * @param {string} id - The ID of the message to update.
   * @param {Partial<Message>} updates - The fields to update.
   * @returns {Promise<UseCaseResponse<Message>>} The response data.
   */
  execute(
    id: string,
    updates: Partial<Message>
  ): Promise<UseCaseResponse<Message>>;
}
