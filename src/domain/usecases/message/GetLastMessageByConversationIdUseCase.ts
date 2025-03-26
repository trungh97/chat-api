import { Message } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves the last message of a conversation.
 */
export interface IGetLastMessageByConversationIdUseCase {
  /**
   * Executes the get last message by conversation ID use case.
   *
   * @async
   * @param {string} conversationId - The ID of the conversation.
   * @returns {Promise<UseCaseResponse<Message>>} The response data.
   */
  execute(conversationId: string): Promise<UseCaseResponse<Message>>;
}
