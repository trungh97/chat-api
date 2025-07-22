import { FriendRequest } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export type GetFriendRequestsByUserIdResponse = UseCaseResponse<FriendRequest[]>;
