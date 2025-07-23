import { CreateConversationRequest } from "./create-conversation.request";
import { CreateConversationResponse } from "./create-conversation.response";

export interface ICreateConversationUsecase {
  /**
   * Executes the create conversation use case.
   *
   * @param {CreateConversationRequest} request - The request data.
   * @returns {Promise<CreateConversationResponse>} The response data.
   */
  execute(
    request: CreateConversationRequest
  ): Promise<CreateConversationResponse>;
}
