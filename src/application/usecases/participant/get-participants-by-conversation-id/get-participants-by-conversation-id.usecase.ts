import { GetParticipantsByConversationIdRequest } from "./get-participants-by-conversation-id.request";
import { GetParticipantsByConversationIdResponse } from "./get-participants-by-conversation-id.response";

export interface IGetParticipantsByConversationIdUseCase {
  /**
   * Executes the get participants by conversation ID use case.
   *
   * @param {GetParticipantsByConversationIdRequest} request - The request data.
   * @returns {Promise<GetParticipantsByConversationIdResponse>} The response data.
   */
  execute(
    request: GetParticipantsByConversationIdRequest
  ): Promise<GetParticipantsByConversationIdResponse>;
}
