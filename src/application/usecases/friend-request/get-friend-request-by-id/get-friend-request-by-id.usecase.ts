import { GetFriendRequestByIdResponse } from "./get-friend-request-by-id.response";

export interface IGetFriendRequestByIdUseCase {
  execute(id: string): Promise<GetFriendRequestByIdResponse>;
}
