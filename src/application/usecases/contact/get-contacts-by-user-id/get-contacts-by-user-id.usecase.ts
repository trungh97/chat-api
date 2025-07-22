import { GetContactsByUserIdResponse } from "./get-contacts-by-user-id.response";

export interface IGetContactsByUserIdUseCase {
  execute(userId: string): Promise<GetContactsByUserIdResponse>;
}
