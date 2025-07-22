import { GetMessageByIdRequest } from "./get-message-by-id.request";
import { GetMessageByIdResponse } from "./get-message-by-id.response";

export interface IGetMessageByIdUseCase {
  execute(request: GetMessageByIdRequest): Promise<GetMessageByIdResponse>;
}
