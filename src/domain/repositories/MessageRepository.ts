import { IMessageRepositoryDTO } from "@domain/dtos/message";
import { Message } from "@domain/entities";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { RepositoryResponse } from "@shared/responses";

export interface IMessageRepository {
  /**
   * Creates a new message.
   *
   * @param {Message} message - The message to be created.
   * @returns {Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>} The response object.
   */
  createMessage(
    message: Message
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>;

  /**
   * Retrieves a message by its ID.
   *
   * @param {string} id - The ID of the message.
   * @returns {Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>} The response object.
   */
  getMessageById(
    id: string
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>;

  /**
   * Updates an existing message.
   *
   * @param {string} id - The ID of the message to update.
   * @param {Partial<Message>} updates - The fields to update.
   * @returns {Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>} The response object.
   */
  updateMessage(
    id: string,
    updates: Partial<Message>
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>;

  /**
   * Deletes a message by its ID.
   *
   * @param {string} id - The ID of the message to delete.
   * @returns {Promise<RepositoryResponse<boolean, Error>>} The response object.
   */
  deleteMessage(id: string): Promise<RepositoryResponse<boolean, Error>>;

  /**
   * Retrieves all messages for a specific conversation.
   *
   * @param {string} conversationId - The ID of the conversation.
   * @returns {Promise<RepositoryResponse<ICursorBasedPaginationResponse<IMessageRepositoryDTO>, Error>>} The response object.
   */
  getMessagesByConversationId(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<
    RepositoryResponse<
      ICursorBasedPaginationResponse<IMessageRepositoryDTO>,
      Error
    >
  >;

  /**
   * Retrieves the last message of a specific conversation.
   *
   * @param {string} conversationId - The ID of the conversation.
   * @returns {Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>} The response object.
   */
  getLastMessageByConversationId(
    conversationId: string
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>>;
}
