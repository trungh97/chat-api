import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetFriendRequestByUsersResponse } from "./get-friend-request-by-users.response";
import { IGetFriendRequestByUsersUseCase } from "./get-friend-request-by-users.usecase";
import { GetFriendRequestByUsersRequest } from "./get-friend-request-by-users.request";

/**
 * Implementation of the GetFriendRequestByUsersUseCase.
 */
@injectable()
export class GetFriendRequestByUsersUseCase
  implements IGetFriendRequestByUsersUseCase
{
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    senderId,
    receiverId,
  }: GetFriendRequestByUsersRequest): Promise<GetFriendRequestByUsersResponse> {
    if (senderId === receiverId) {
      const errorMessage = "Sender and receiver cannot be the same.";
      this.logger.error(errorMessage);
      return {
        data: null,
        error: errorMessage,
      };
    }

    try {
      const friendRequestResponse =
        await this.friendRequestRepository.getFriendRequestByUsers(
          senderId,
          receiverId
        );

      if (friendRequestResponse.error) {
        this.logger.error(
          `Friend request with senderId ${senderId} and receiverId ${receiverId} not found`
        );
        return {
          data: null,
          error: `Friend request with senderId ${senderId} and receiverId ${receiverId} not found`,
        };
      }

      return {
        data: friendRequestResponse.value,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching friend request with senderId ${senderId} and receiverId ${receiverId}: ${error.message}`
      );
      return {
        data: null,
        error: `Error fetching friend request with senderId ${senderId} and receiverId ${receiverId}: ${error.message}`,
      };
    }
  }
}
