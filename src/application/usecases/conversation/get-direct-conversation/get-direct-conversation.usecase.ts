import { GetDirectConversationRequest } from "./get-direct-conversation.request";
import { GetDirectConversationResponse } from "./get-direct-conversation.response";

export interface IGetDirectConversationUseCase {
  /**
   * Finds the caller's 1:1 conversation with another user, with the title the caller sees.
   *
   * @param {GetDirectConversationRequest} request - The caller and the other user.
   * @returns {Promise<GetDirectConversationResponse>} The conversation, or null if there is none.
   */
  execute(
    request: GetDirectConversationRequest
  ): Promise<GetDirectConversationResponse>;
}
