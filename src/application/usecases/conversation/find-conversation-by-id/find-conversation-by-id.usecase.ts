import { FindConversationByIdRequest } from "./find-conversation-by-id.request";
import { FindConversationByIdResponse } from "./find-conversation-by-id.response";

export interface IFindConversationByIdUseCase {
/**
 * Executes the find conversation by ID use case.
 *
 * @param {FindConversationByIdRequest} request - The request data containing the conversation ID and user ID.
 * @returns {Promise<FindConversationByIdResponse>} The response data containing the conversation details or an error message.
 */

  execute(
    request: FindConversationByIdRequest
  ): Promise<FindConversationByIdResponse>;
}
