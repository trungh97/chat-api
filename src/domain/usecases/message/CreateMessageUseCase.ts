import { Message } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that creates a message.
 */
export interface ICreateMessageUseCase {
  /**
   * Executes the create message use case.
   *
   * @async
   * @param {string} currentUserId - The ID of the current user.
   * @param {Message} message - The message to create.
   * @returns {Promise<UseCaseResponse<Message>>} The response data.
   */
  execute(
    currentUserId: string,
    message: Message
  ): Promise<UseCaseResponse<Message>>;
}
