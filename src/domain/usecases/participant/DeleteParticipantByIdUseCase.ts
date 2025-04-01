import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that deletes a participant by ID.
 */
export interface IDeleteParticipantByIdUseCase {
  /**
   * Executes the delete participant by ID use case.
   *
   * @async
   * @param {string} id - The ID of the participant to delete.
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} currentUserId - The ID of the current user.
   * @returns {Promise<UseCaseResponse<boolean>>} The response data.
   */
  execute(
    id: string,
    conversationId: string,
    currentUserId: string
  ): Promise<UseCaseResponse<boolean>>;
}
