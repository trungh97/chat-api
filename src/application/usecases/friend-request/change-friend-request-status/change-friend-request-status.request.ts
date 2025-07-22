import { FriendRequestStatus } from "@domain/enums";
import { User } from "@domain/entities";

export interface ChangeFriendRequestStatusRequest {
  id: string;
  status: FriendRequestStatus;
  currentUserId: User["id"];
}
