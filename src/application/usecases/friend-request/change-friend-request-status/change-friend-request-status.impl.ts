import { User } from "@domain/entities";
import { FriendRequestStatus } from "@domain/enums";
import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { ChangeFriendRequestStatusResponse } from "./change-friend-request-status.response";
import { IChangeFriendRequestStatusUseCase } from "./change-friend-request-status.usecase";
import { ChangeFriendRequestStatusRequest } from "./change-friend-request-status.request";

@injectable()
export class ChangeFriendRequestStatusUseCase
  implements IChangeFriendRequestStatusUseCase
{
  constructor(
    @inject(TYPES.FriendRequestRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    id,
    status,
    currentUserId,
  }: ChangeFriendRequestStatusRequest): Promise<ChangeFriendRequestStatusResponse> {
    try {
      const friendRequestResponse =
        await this.friendRequestRepository.getFriendRequestById(id);

      if (friendRequestResponse.error) {
        this.logger.error(`Friend request with id ${id} not found`);
        return {
          data: null,
          error: `Friend request with id ${id} not found`,
        };
      }

      if (currentUserId !== friendRequestResponse.value.receiverId) {
        return {
          data: null,
          error: `You are not allowed to change friend request status with id ${id}`,
        };
      }

      const friendRequest = friendRequestResponse.value;
      if (
        status === FriendRequestStatus.PENDING ||
        friendRequest.status !== FriendRequestStatus.PENDING
      ) {
        return {
          data: null,
          error: `Can not change Friend request status with id ${id}`,
        };
      }
      friendRequest.status = status;

      const updateResponse =
        await this.friendRequestRepository.changeFriendRequestStatus(
          id,
          status
        );

      if (updateResponse.error) {
        this.logger.error(
          `Error updating friend request status: ${updateResponse.error.message}`
        );
        return {
          data: null,
          error: `Error updating friend request status: ${updateResponse.error.message}`,
        };
      }

      return {
        data: friendRequest,
      };
    } catch (error) {
      this.logger.error(
        `Error changing friend request status: ${error.message}`
      );
      return {
        data: null,
        error: `Error changing friend request status: ${error.message}`,
      };
    }
  }
}
