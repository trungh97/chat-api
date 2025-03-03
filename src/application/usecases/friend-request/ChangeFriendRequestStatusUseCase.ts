import { FriendRequest } from "@domain/entities";
import { FriendRequestStatus } from "@domain/enums";
import { IFriendRequestRepository } from "@domain/repositories";
import { IChangeFriendRequestStatusUseCase } from "@domain/usecases/friend-request/ChangeFriendRequestStatusUseCase";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

/**
 * Implementation of the ChangeFriendRequestStatusUseCase.
 */
@injectable()
export class ChangeFriendRequestStatusUseCase
  implements IChangeFriendRequestStatusUseCase
{
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    id: string,
    status: FriendRequestStatus
  ): Promise<RepositoryResponse<FriendRequest, Error>> {
    try {
      const friendRequestResponse =
        await this.friendRequestRepository.getFriendRequestById(id);

      if (friendRequestResponse.error) {
        this.logger.error(`Friend request with id ${id} not found`);
        return {
          value: null,
          error: new Error(`Friend request with id ${id} not found`),
        };
      }

      const friendRequest = friendRequestResponse.value;
      if (
        status === FriendRequestStatus.PENDING ||
        friendRequest.status !== FriendRequestStatus.PENDING
      ) {
        return {
          value: null,
          error: new Error(
            `Can not change Friend request status with id ${id}`
          ),
        };
      }
      friendRequest.status = status;
      // TODO: if status is DECLINED, keep it for a period of time, then run a job to delete it

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
          value: null,
          error: new Error(
            `Error updating friend request status: ${updateResponse.error.message}`
          ),
        };
      }

      return {
        value: friendRequest,
      };
    } catch (error) {
      this.logger.error(
        `Error changing friend request status: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error changing friend request status: ${error.message}`
        ),
      };
    }
  }
}
