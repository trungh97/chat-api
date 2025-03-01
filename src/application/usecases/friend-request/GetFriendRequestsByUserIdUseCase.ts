import { FriendRequest } from "@domain/entities";
import { IFriendRequestRepository } from "@domain/repositories";
import { IGetFriendRequestsByUserIdUseCase } from "@domain/usecases/friend-request/GetFriendRequestsByUserIdUseCase";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

/**
 * Implementation of the GetFriendRequestsByUserIdUseCase.
 */
@injectable()
export class GetFriendRequestsByUserIdUseCase
  implements IGetFriendRequestsByUserIdUseCase
{
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    userId: string
  ): Promise<RepositoryResponse<FriendRequest[], Error>> {
    try {
      const friendRequestsResponse =
        await this.friendRequestRepository.getFriendRequestsByUserId(userId);

      if (friendRequestsResponse.error) {
        this.logger.error(
          `Error fetching friend requests for userId ${userId}: ${friendRequestsResponse.error.message}`
        );
        return {
          value: null,
          error: new Error(
            `Error fetching friend requests for userId ${userId}: ${friendRequestsResponse.error.message}`
          ),
        };
      }

      return {
        value: friendRequestsResponse.value,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching friend requests for userId ${userId}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error fetching friend requests for userId ${userId}: ${error.message}`
        ),
      };
    }
  }
}
