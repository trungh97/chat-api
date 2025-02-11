import { RepositoryResponse } from "@shared/responses";

export interface IParticipantRepository {
  /**
   * Creates a new participant in a conversation.
   *
   * @param conversationId - The unique identifier of the conversation.
   * @param userId - The unique identifier of the user.
   * @returns A promise resolving to an empty response or an error.
   */
  createParticipant(
    conversationId: string,
    userId: string
  ): Promise<RepositoryResponse<void, Error>>;

  /**
   * Checks if a participant exists in a conversation.
   *
   * @param conversationId - The unique identifier of the conversation.
   * @param userId - The unique identifier of the user.
   * @returns A promise resolving to a boolean indicating if the user is a participant in the conversation.
   */
  getParticipantById(
    conversationId: string,
    userId: string
  ): Promise<RepositoryResponse<boolean, Error>>;

  /**
   * Deletes a participant from a conversation.
   *
   * @param conversationId - The unique identifier of the conversation.
   * @param userId - The unique identifier of the user.
   * @returns A promise resolving to an empty response or an error.
   */
  deleteParticipantById(
    conversationId: string,
    userId: string
  ): Promise<RepositoryResponse<void, Error>>;

  /**
   * Fetches the names of the participants with the given IDs.
   *
   * @param userIds - An array of unique identifiers of the users.
   * @returns A promise resolving to an array of names of the participants.
   */
  getParticipantsNamesByIds(
    userIds: string[]
  ): Promise<RepositoryResponse<string[], Error>>;
}
