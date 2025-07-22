import { FindConversationByIdResponse } from "./find-conversation-by-id.response";

export interface IFindConversationByIdUseCase {
  execute(id: string, userId: string): Promise<FindConversationByIdResponse>;
}
