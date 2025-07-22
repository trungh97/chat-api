import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { DeleteExpiredFriendRequestsResponse } from "./delete-expired-friend-requests.response";
import { IDeleteExpiredFriendRequestsUseCase } from "./delete-expired-friend-requests.usecase";
import { DeleteExpiredFriendRequestsRequest } from "./delete-expired-friend-requests.request";

/**
 * Implementation of the DeleteExpiredFriendRequestsUseCase.
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

  async execute({
    days,
  }: DeleteExpiredFriendRequestsRequest): Promise<DeleteExpiredFriendRequestsResponse> {
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
