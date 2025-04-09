import { UseCaseResponse } from "@shared/responses";
import { Conversation, Participant } from "@domain/entities";

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
   * @returns {Promise<UseCaseResponse<Conversation & { participants: Participant[] }>>} The response data
   */
  execute(
    id: string,
    userId: string
  ): Promise<
    UseCaseResponse<
      Conversation & {
        participants: Participant[];
      }
    >
  >;
}
