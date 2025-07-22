import { GetFriendRequestsByUserIdResponse } from "./get-friend-requests-by-user-id.response";

export interface IGetFriendRequestsByUserIdUseCase {
  execute(userId: string): Promise<GetFriendRequestsByUserIdResponse>;
}
