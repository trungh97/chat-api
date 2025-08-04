import { DeleteMessageRequest } from "./delete-message.request";
import { DeleteMessageResponse } from "./delete-message.response";

export interface IDeleteMessageUseCase {
  execute(request: DeleteMessageRequest): Promise<DeleteMessageResponse>;
}
