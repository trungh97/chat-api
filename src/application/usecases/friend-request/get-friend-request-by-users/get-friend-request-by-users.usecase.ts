import { GetFriendRequestByUsersRequest } from "./get-friend-request-by-users.request";
import { GetFriendRequestByUsersResponse } from "./get-friend-request-by-users.response";

export interface IGetFriendRequestByUsersUseCase {
  execute(
    request: GetFriendRequestByUsersRequest
  ): Promise<GetFriendRequestByUsersResponse>;
}
