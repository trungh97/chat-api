import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { DeleteFriendRequestResponse } from "./delete-friend-request.response";
import { IDeleteFriendRequestUseCase } from "./delete-friend-request.usecase";

@injectable()
export class DeleteFriendRequestUseCase implements IDeleteFriendRequestUseCase {
  constructor(
    @inject(TYPES.FriendRequestRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<DeleteFriendRequestResponse> {
    try {
      const deleteResponse =
        await this.friendRequestRepository.deleteFriendRequest(id);

      if (deleteResponse.error) {
        this.logger.error(
          `Error deleting friend request with id ${id}: ${deleteResponse.error.message}`
        );
        return {
          data: false,
          error: `Error deleting friend request with id ${id}: ${deleteResponse.error.message}`,
        };
      }

      return {
        data: true,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting friend request with id ${id}: ${error.message}`
      );
      return {
        data: false,
        error: `Error deleting friend request with id ${id}: ${error.message}`,
      };
    }
  }
}
