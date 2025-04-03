import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";
import { Conversation } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that create a conversation.
 *
 * @interface
 */
export interface ICreateConversationUsecase {
  /**
   * Executes the create conversation use case.
   *
   * @async
   * @param {string} userId - The ID of the user creating the conversation.
   * @param {ICreateConversationRequestDTO} conversation - The conversation data to create.
   * @returns {Promise<UseCaseResponse<Conversation>>} The response data.
   */
  execute(
    userId: string,
    conversation: ICreateConversationRequestDTO
  ): Promise<UseCaseResponse<Conversation>>;
}
