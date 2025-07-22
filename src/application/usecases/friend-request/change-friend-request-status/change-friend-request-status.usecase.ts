import { ChangeFriendRequestStatusRequest } from "./change-friend-request-status.request";
import { ChangeFriendRequestStatusResponse } from "./change-friend-request-status.response";

export interface IChangeFriendRequestStatusUseCase {
  execute(
    request: ChangeFriendRequestStatusRequest
  ): Promise<ChangeFriendRequestStatusResponse>;
}
