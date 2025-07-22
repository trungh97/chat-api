import { GetMessageByIdResponse } from "./get-message-by-id.response";

export interface IGetMessageByIdUseCase {
  execute(id: string): Promise<GetMessageByIdResponse>;
}
