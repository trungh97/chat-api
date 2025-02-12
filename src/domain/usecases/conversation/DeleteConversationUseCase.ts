import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that deletes a conversation.
 *
 * @interface
 */
export interface IDeleteConversationUsecase {
  /**
   * Deletes a conversation by its unique identifier.
   *
   * @param id - The unique identifier of the conversation.
   * @returns A promise resolving to a boolean indicating success of the operation.
   */
  execute(id: string): Promise<UseCaseResponse<boolean>>;
}
