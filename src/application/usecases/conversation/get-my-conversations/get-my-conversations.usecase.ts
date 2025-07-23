import { GetMyConversationsRequest } from "./get-my-conversations.request";
import { GetMyConversationsResponse } from "./get-my-conversations.response";

export interface IGetMyConversationsUsecase {
  /**
   * Executes the get my conversations use case.
   *
   * @param {GetMyConversationsRequest} request - The request containing user ID and pagination parameters.
   * @returns {Promise<GetMyConversationsResponse>} A promise resolving to the response containing conversation data or an error message.
   */
  execute(
    request: GetMyConversationsRequest
  ): Promise<GetMyConversationsResponse>;
}
