import { IDetailedParticipantDTO } from "@domain/dtos";
import { Participant } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

export interface IParticipantRepository {
  /**
   * Creates a new participant in a conversation.
   *
   * @param participant - The participant entity to be created.
   * @returns A promise resolving to a participant response or an error.
   */
  createParticipant(
    participant: Participant
  ): Promise<RepositoryResponse<IDetailedParticipantDTO, Error>>;

  /**
   * Checks if a participant exists in a conversation.
   *
   * @param conversationId - The unique identifier of the conversation.
   * @param userId - The unique identifier of the user.
   * @returns A promise resolving to a participant indicating if the user is a participant in the conversation.
   */
  getParticipantById(
    conversationId: string,
    userId: string
  ): Promise<RepositoryResponse<Participant, Error>>;

  /**
   * Deletes a participant from a conversation.
   *
   * @param id - The unique identifier of the participant.
   * @returns A promise resolving to an empty response or an error.
   */
  deleteParticipantById(
    id: string
  ): Promise<RepositoryResponse<boolean, Error>>;

  /**
   * Fetches the names of the participants with the given IDs.
   *
   * @param userIds - An array of unique identifiers of the users.
   * @returns A promise resolving to an array of names of the participants.
   */
  getParticipantsNamesByIds(
    userIds: string[]
  ): Promise<RepositoryResponse<string[], Error>>;

  /**
   * Fetches all participants in a conversation.
   *
   * @param conversationId - The unique identifier of the conversation.
   * @returns A promise resolving to an array of participants in the conversation.
   */
  getParticipantsByConversationId(
    conversationId: string
  ): Promise<RepositoryResponse<Participant[], Error>>;

  /**
   * Updates the type of a participant in a conversation.
   *
   * @param conversationId - The unique identifier of the conversation.
   * @param userId - The unique identifier of the user.
   * @param type - The type of the participant.
   * @returns A promise resolving to a participant response or an error.
   */
  updateParticipantType(
    conversationId: string,
    userId: string,
    type: string
  ): Promise<RepositoryResponse<Participant, Error>>;
}
