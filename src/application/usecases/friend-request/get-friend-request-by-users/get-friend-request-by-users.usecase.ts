import { GetFriendRequestByUsersResponse } from "./get-friend-request-by-users.response";

export interface IGetFriendRequestByUsersUseCase {
  execute(
    senderId: string,
    receiverId: string
  ): Promise<GetFriendRequestByUsersResponse>;
}
