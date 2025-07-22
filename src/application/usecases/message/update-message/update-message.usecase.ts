import { UpdateMessageRequest } from "./update-message.request";
import { UpdateMessageResponse } from "./update-message.response";

export interface IUpdateMessageUseCase {
  execute(
    request: UpdateMessageRequest
  ): Promise<UpdateMessageResponse>;
}
