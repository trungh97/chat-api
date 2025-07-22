import { ICreateSystemMessageRequest } from "./create-system-message.request";
import { CreateSystemMessageResponse } from "./create-system-message.response";

export interface ICreateSystemMessageUseCase {
  execute(request: ICreateSystemMessageRequest): Promise<CreateSystemMessageResponse>;
}
