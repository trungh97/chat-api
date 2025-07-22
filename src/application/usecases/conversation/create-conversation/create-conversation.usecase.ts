import { CreateConversationRequest } from "./create-conversation.request";
import { CreateConversationResponse } from "./create-conversation.response";

export interface ICreateConversationUsecase {
  execute(
    userId: string,
    conversation: CreateConversationRequest
  ): Promise<CreateConversationResponse>;
}
