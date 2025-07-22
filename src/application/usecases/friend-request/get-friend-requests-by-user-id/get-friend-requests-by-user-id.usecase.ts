import { GetFriendRequestsByUserIdRequest } from "./get-friend-requests-by-user-id.request";
import { GetFriendRequestsByUserIdResponse } from "./get-friend-requests-by-user-id.response";

export interface IGetFriendRequestsByUserIdUseCase {
  execute(
    request: GetFriendRequestsByUserIdRequest
  ): Promise<GetFriendRequestsByUserIdResponse>;
}
