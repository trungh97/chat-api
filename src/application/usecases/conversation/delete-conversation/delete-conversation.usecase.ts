import { DeleteConversationResponse } from "./delete-conversation.response";

export interface IDeleteConversationUsecase {
  execute(id: string): Promise<DeleteConversationResponse>;
}
