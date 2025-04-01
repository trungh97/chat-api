import { Participant } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves a participant by ID.
 */
export interface IGetParticipantByIdUseCase {
  /**
   * Executes the get participant by ID use case.
   *
   * @async
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<UseCaseResponse<Participant>>} The response data.
   */
  execute(
    conversationId: string,
    userId: string
  ): Promise<UseCaseResponse<Participant>>;
}
