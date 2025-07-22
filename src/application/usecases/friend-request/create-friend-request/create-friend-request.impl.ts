import { FriendRequest } from "@domain/entities";
import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { CreateFriendRequestRequest } from "./create-friend-request.request";
import { CreateFriendRequestResponse } from "./create-friend-request.response";
import { ICreateFriendRequestUseCase } from "./create-friend-request.usecase";

@injectable()
export class CreateFriendRequestUseCase implements ICreateFriendRequestUseCase {
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    request: CreateFriendRequestRequest
  ): Promise<CreateFriendRequestResponse> {
    try {
      const { senderId, receiverId } = request;

      // Check if the friend request already exists
      const existingFriendRequest =
        await this.friendRequestRepository.getFriendRequestByUsers(
          senderId,
          receiverId
        );

      if (existingFriendRequest.value) {
        const errorMessage = "This friend request already exists!";
        this.logger.error(errorMessage);
        return {
          data: null,
          error: errorMessage,
        };
      }

      const newFriendRequest = await FriendRequest.create(request);
      const result = await this.friendRequestRepository.createFriendRequest(
        newFriendRequest
      );

      if (result.error) {
        this.logger.error(result.error.message);
        return {
          data: null,
          error: result.error.message,
        };
      }

      return {
        data: result.value,
      };
    } catch (error) {
      this.logger.error(
        `Error executing create friend request use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing create friend request use case: ${error.message}`,
      };
    }
  }
}
