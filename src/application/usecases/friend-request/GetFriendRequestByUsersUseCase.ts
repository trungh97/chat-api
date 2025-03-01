import { inject, injectable } from "inversify";
import { IFriendRequestRepository } from "@domain/repositories";
import { IGetFriendRequestByUsersUseCase } from "@domain/usecases/friend-request/GetFriendRequestByUsersUseCase";
import { TYPES } from "@infrastructure/external/di/inversify";
import { FriendRequest } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";
import { ILogger } from "@shared/logger";

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

  async execute(
    senderId: string,
    receiverId: string
  ): Promise<RepositoryResponse<FriendRequest, Error>> {
    if (senderId === receiverId) {
      const errorMessage = "Sender and receiver cannot be the same.";
      this.logger.error(errorMessage);
      return {
        value: null,
        error: new Error(errorMessage),
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
          value: null,
          error: new Error(
            `Friend request with senderId ${senderId} and receiverId ${receiverId} not found`
          ),
        };
      }

      return {
        value: friendRequestResponse.value,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching friend request with senderId ${senderId} and receiverId ${receiverId}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error fetching friend request with senderId ${senderId} and receiverId ${receiverId}: ${error.message}`
        ),
      };
    }
  }
}
