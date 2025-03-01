import { inject, injectable } from "inversify";
import { IFriendRequestRepository } from "@domain/repositories";
import { IDeleteFriendRequestUseCase } from "@domain/usecases/friend-request/DeleteFriendRequestUseCase";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";

/**
 * Implementation of the DeleteFriendRequestUseCase.
 */
@injectable()
export class DeleteFriendRequestUseCase implements IDeleteFriendRequestUseCase {
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<RepositoryResponse<boolean, Error>> {
    try {
      const deleteResponse =
        await this.friendRequestRepository.deleteFriendRequest(id);

      if (deleteResponse.error) {
        this.logger.error(
          `Error deleting friend request with id ${id}: ${deleteResponse.error.message}`
        );
        return {
          value: false,
          error: new Error(
            `Error deleting friend request with id ${id}: ${deleteResponse.error.message}`
          ),
        };
      }

      return {
        value: true,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting friend request with id ${id}: ${error.message}`
      );
      return {
        value: false,
        error: new Error(
          `Error deleting friend request with id ${id}: ${error.message}`
        ),
      };
    }
  }
}
