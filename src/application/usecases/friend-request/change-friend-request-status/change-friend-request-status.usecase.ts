import { User } from "@domain/entities";
import { FriendRequestStatus } from "@domain/enums";
import { ChangeFriendRequestStatusResponse } from "./change-friend-request-status.response";

export interface IChangeFriendRequestStatusUseCase {
  execute(
    id: string,
    status: FriendRequestStatus,
    currentUserId: User["id"]
  ): Promise<ChangeFriendRequestStatusResponse>;
}
