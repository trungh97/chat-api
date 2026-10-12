import { UpdateMessageStatusRequest } from "./update-message-status.request";
import { UpdateMessageStatusResponse } from "./update-message-status.response";

export interface IUpdateMessageStatusUseCase {
  execute(
    request: UpdateMessageStatusRequest
  ): Promise<UpdateMessageStatusResponse>;
}
