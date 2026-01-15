import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetFriendRequestsByUserIdResponse } from "./get-friend-requests-by-user-id.response";
import { IGetFriendRequestsByUserIdUseCase } from "./get-friend-requests-by-user-id.usecase";
import { GetFriendRequestsByUserIdRequest } from "./get-friend-requests-by-user-id.request";

/**
 * Implementation of the GetFriendRequestsByUserIdUseCase.
 */
@injectable()
export class GetFriendRequestsByUserIdUseCase
  implements IGetFriendRequestsByUserIdUseCase
{
  constructor(
    @inject(TYPES.FriendRequestRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    userId,
  }: GetFriendRequestsByUserIdRequest): Promise<GetFriendRequestsByUserIdResponse> {
    try {
      const friendRequestsResponse =
        await this.friendRequestRepository.getFriendRequestsByUserId(userId);

      if (friendRequestsResponse.error) {
        this.logger.error(
          `Error fetching friend requests for userId ${userId}: ${friendRequestsResponse.error.message}`
        );
        return {
          data: null,
          error: `Error fetching friend requests for userId ${userId}: ${friendRequestsResponse.error.message}`,
        };
      }

      return {
        data: friendRequestsResponse.value,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching friend requests for userId ${userId}: ${error.message}`
      );
      return {
        data: null,
        error: `Error fetching friend requests for userId ${userId}: ${error.message}`,
      };
    }
  }
}
