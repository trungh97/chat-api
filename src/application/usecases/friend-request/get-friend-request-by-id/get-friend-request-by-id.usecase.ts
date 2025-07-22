import { GetFriendRequestByIdRequest } from "./get-friend-request-by-id.request";
import { GetFriendRequestByIdResponse } from "./get-friend-request-by-id.response";

export interface IGetFriendRequestByIdUseCase {
  execute(request: GetFriendRequestByIdRequest): Promise<GetFriendRequestByIdResponse>;
}
