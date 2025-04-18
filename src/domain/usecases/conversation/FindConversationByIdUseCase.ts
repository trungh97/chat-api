import { IConversationResponseDTO } from "@domain/dtos/conversation";
import { UseCaseResponse } from "@shared/responses";

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
   * @param {string} userId - The user id of the participant
   * @returns {Promise<UseCaseResponse<IConversationResponseDTO>>} The response data
   */
  execute(
    id: string,
    userId: string
  ): Promise<UseCaseResponse<IConversationResponseDTO>>;
}
