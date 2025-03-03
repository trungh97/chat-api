import { IFriendRequestRepository } from "@domain/repositories";
import { IDeleteExpiredFriendRequestsUseCase } from "@domain/usecases/friend-request";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

/**
 * Implementation of the FindExpiredFriendRequestsUseCase.
 */
@injectable()
export class DeleteExpiredFriendRequestsUseCase
  implements IDeleteExpiredFriendRequestsUseCase
{
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(days: number): Promise<RepositoryResponse<void, Error>> {
    try {
      const response =
        await this.friendRequestRepository.findDeclinedFriendRequestsOlderThan(
          days
        );

      if (response.error) {
        this.logger.error(
          `Error finding declined friend requests older than ${days} days: ${response.error.message}`
        );
        return;
      }

      if (response.value) {
        const expiredRequests = response.value;
        for (const request of expiredRequests) {
          await this.friendRequestRepository.deleteFriendRequest(request.id);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error finding declined friend requests older than ${days} days: ${error.message}`
      );
      return;
    }
  }
}
