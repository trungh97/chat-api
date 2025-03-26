import { Message } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves a message by ID.
 */
export interface IGetMessageByIdUseCase {
  /**
   * Executes the get message by ID use case.
   *
   * @async
   * @param {string} id - The ID of the message to retrieve.
   * @returns {Promise<UseCaseResponse<Message>>} The response data.
   */
  execute(id: string): Promise<UseCaseResponse<Message>>;
}
