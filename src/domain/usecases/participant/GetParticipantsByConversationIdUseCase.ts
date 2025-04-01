import { Participant } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves participants by conversation ID.
 */
export interface IGetParticipantsByConversationIdUseCase {
  /**
   * Executes the get participants by conversation ID use case.
   *
   * @async
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} currentUserId - The ID of the current user.
   * @returns {Promise<UseCaseResponse<Participant[]>>} The response data.
   */
  execute(
    conversationId: string,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant[]>>;
}
