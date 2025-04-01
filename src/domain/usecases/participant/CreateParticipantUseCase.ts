import { Participant } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that creates a participant.
 */
export interface ICreateParticipantUseCase {
  /**
   * Executes the create participant use case.
   *
   * @async
   * @param {Participant} participant - The participant to create.
   * @param {string} currentUserId - The ID of the user creating the participant.
   * @returns {Promise<UseCaseResponse<Participant>>} The response data.
   */
  execute(
    participant: Participant,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant>>;
}
