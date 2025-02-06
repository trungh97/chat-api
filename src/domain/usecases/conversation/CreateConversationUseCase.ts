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
   * @returns {Promise<UseCaseResponse<Conversation>>} The response data.
   */
  execute(
    conversation: ICreateConversationRequestDTO
  ): Promise<UseCaseResponse<Conversation>>;
}
