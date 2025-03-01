import { FriendRequest } from "@domain/entities";
import { IFriendRequestRepository } from "@domain/repositories";
import { IGetFriendRequestByIdUseCase } from "@domain/usecases/friend-request/GetFriendRequestByIdUseCase";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

/**
 * Implementation of the GetFriendRequestByIdUseCase.
 */
@injectable()
export class GetFriendRequestByIdUseCase
  implements IGetFriendRequestByIdUseCase
{
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<RepositoryResponse<FriendRequest, Error>> {
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

      return {
        value: friendRequestResponse.value,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching friend request with id ${id}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error fetching friend request with id ${id}: ${error.message}`
        ),
      };
    }
  }
}
