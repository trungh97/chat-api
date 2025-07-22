import { GetMessagesByConversationIdRequest } from "./get-messages-by-conversation-id.request";
import { GetMessagesByConversationIdResponse } from "./get-messages-by-conversation-id.response";

export interface IGetMessagesByConversationIdUseCase {
  execute(
    request: GetMessagesByConversationIdRequest
  ): Promise<GetMessagesByConversationIdResponse>;
}
