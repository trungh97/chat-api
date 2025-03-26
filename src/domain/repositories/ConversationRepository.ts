import { Conversation } from "@domain/entities";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { RepositoryResponse } from "@shared/responses";

export interface IConversationRepository {
  /**
   * Fetches all conversations.
   * @returns A promise resolving to an array of all conversations.
   */
  getAllConversations(
    cursor?: string,
    limit?: number
  ): Promise<
    RepositoryResponse<ICursorBasedPaginationResponse<Conversation>, Error>
  >;

  /**
   * Fetches a conversation by its unique identifier.
   * @param id - The unique identifier of the conversation.
   * @returns A promise resolving to the conversation, if found.
   */
  getConversationById(
    id: string
  ): Promise<RepositoryResponse<Conversation, Error>>;

  /**
   * Creates a new conversation.
   * @param conversation - The conversation entity to be created.
   * @returns A promise resolving to the created conversation.
   */
  createConversation(
    conversation: Conversation,
    participants: string[]
  ): Promise<RepositoryResponse<Conversation, Error>>;

  /**
   * Updates an existing conversation.
   * @param id - The unique identifier of the conversation to update.
   * @param conversation - The conversation entity with updated fields.
   * @returns A promise resolving to the updated conversation or null if not found.
   */
  updateConversation(
    id: string,
    conversation: Conversation
  ): Promise<RepositoryResponse<Conversation, Error>>;

  /**
   * Deletes a conversation by its unique identifier.
   * @param id - The unique identifier of the conversation.
   * @returns A promise resolving to a boolean indicating success of the operation.
   */
  deleteConversation(id: string): Promise<RepositoryResponse<boolean, Error>>;
}
