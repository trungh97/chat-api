import { Message } from "@domain/entities";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves messages by conversation ID.
 */
export interface IGetMessagesByConversationIdUseCase {
  /**
   * Executes the get messages by conversation ID use case.
   *
   * @async
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} [cursor] - The cursor for pagination.
   * @param {number} [limit] - The number of messages to retrieve.
   * @returns {Promise<UseCaseResponse<ICursorBasedPaginationResponse<Message>>>} The response data.
   */
  execute(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<UseCaseResponse<ICursorBasedPaginationResponse<Message>>>;
}
