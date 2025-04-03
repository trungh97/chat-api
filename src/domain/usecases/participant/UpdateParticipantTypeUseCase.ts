import { Participant } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that updates the type of a participant.
 */
export interface IUpdateParticipantTypeUseCase {
  /**
   * Executes the update participant type use case.
   *
   * @async
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} userId - The ID of the user.
   * @param {string} type - The new type of the participant.
   * @param {string} currentUserId - The ID of the current user.
   * @returns {Promise<UseCaseResponse<Participant>>} The response data.
   */
  execute(
    conversationId: string,
    userId: string,
    type: string,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant>>;
}
