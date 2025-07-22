import { DeleteFriendRequestResponse } from "./delete-friend-request.response";

export interface IDeleteFriendRequestUseCase {
  execute(id: string): Promise<DeleteFriendRequestResponse>;
}
