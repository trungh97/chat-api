import { Message } from "@domain/entities";
import { UpdateMessageResponse } from "./update-message.response";

export interface IUpdateMessageUseCase {
  execute(
    id: string,
    updates: Partial<Message>
  ): Promise<UpdateMessageResponse>;
}
