import { ICreateMessageRequestDTO } from "./create-message.request";
import { CreateMessageResponse } from "./create-message.response";

export interface ICreateMessageUseCase {
  /**
   * Executes the create message use case.
   *
   * @async
   * @param {string} currentUserId - The ID of the current user.
   * @param {ICreateMessageRequestDTO} request - The message to create.
   * @returns {Promise<CreateMessageResponse>} The response data.
   */
  execute(
    currentUserId: string,
    request: ICreateMessageRequestDTO
  ): Promise<CreateMessageResponse>;
}
