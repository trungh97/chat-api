import { ICreateParticipantRequestDTO } from "@domain/dtos/participant";
import { Participant } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that add a participant to the conversation and notify to the other participants.
 */
export interface IAddingParticipantAndNotifyUseCase {
  /**
   * Executes the add participant use case.
   *
   * @async
   * @param {ICreateParticipantRequestDTO} participant - The participant to create.
   * @param {string} currentUserId - The ID of the user creating the participant.
   * @returns {Promise<UseCaseResponse<Participant>>} The response data.
   */
  execute(
    participant: ICreateParticipantRequestDTO,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant>>;
}
