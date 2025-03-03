import { ICreateFriendRequestDTO } from "@domain/dtos/friendRequest";
import { FriendRequest } from "@domain/entities";
import { IFriendRequestRepository } from "@domain/repositories";
import { ICreateFriendRequestUseCase } from "@domain/usecases/friend-request";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class CreateFriendRequestUseCase implements ICreateFriendRequestUseCase {
  constructor(
    @inject(TYPES.FriendRequestPrismaRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    request: ICreateFriendRequestDTO
  ): Promise<RepositoryResponse<FriendRequest, Error>> {
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
          value: null,
          error: new Error(errorMessage),
        };
      }

      const newFriendRequest = await FriendRequest.create(request);
      const result = await this.friendRequestRepository.createFriendRequest(
        newFriendRequest
      );

      if (result.error) {
        this.logger.error(result.error.message);
        return {
          value: null,
          error: new Error(result.error.message),
        };
      }

      return {
        value: result.value,
      };
    } catch (error) {
      this.logger.error(
        `Error executing create friend request use case: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error executing create friend request use case: ${error.message}`
        ),
      };
    }
  }
}
