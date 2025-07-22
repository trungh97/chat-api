import { DeleteMessageResponse } from "./delete-message.response";

export interface IDeleteMessageUseCase {
  execute(id: string): Promise<DeleteMessageResponse>;
}
