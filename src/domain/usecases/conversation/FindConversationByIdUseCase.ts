import { UseCaseResponse } from "@shared/responses";
import { Conversation } from "@domain/entities";

/**
 * Interface for the use case that finds a conversation by its unique identifier.
 *
 * @interface
 */
export interface IFindConversationByIdUseCase {
  /**
   * Executes the find conversation by id use case.
   *
   * @async
   * @param {string} id - The conversation id
   * @returns {Promise<UseCaseResponse<Conversation>>} The response data
   */
  execute(id: string): Promise<UseCaseResponse<Conversation>>;
}
