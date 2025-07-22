import { GetMessagesByConversationIdResponse } from "./get-messages-by-conversation-id.response";

export interface IGetMessagesByConversationIdUseCase {
  execute(
    conversationId: string,
    cursor?: string,
    limit?: number
  ): Promise<GetMessagesByConversationIdResponse>;
}
