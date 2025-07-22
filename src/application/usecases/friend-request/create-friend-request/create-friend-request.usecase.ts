import { ICreateFriendRequest } from "./create-friend-request.request";
import { CreateFriendRequestResponse } from "./create-friend-request.response";

export interface ICreateFriendRequestUseCase {
  execute(
    request: ICreateFriendRequest
  ): Promise<CreateFriendRequestResponse>;
}
