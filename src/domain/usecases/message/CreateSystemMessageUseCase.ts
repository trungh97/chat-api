import { ICreateSystemMessageRequestDTO } from "@domain/dtos/message";
import { Message } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that creates a system message.
 */
export interface ICreateSystemMessageUseCase {
  /**
   * Executes the create system message use case.
   *
   * @async
   * @param {ICreateSystemMessageRequestDTO} request - The message to create.
   * @returns {Promise<UseCaseResponse<Message>>} The response data.
   */
  execute(
    request: ICreateSystemMessageRequestDTO
  ): Promise<UseCaseResponse<Message>>;
}
