import { IFriendRequestRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetFriendRequestByIdResponse } from "./get-friend-request-by-id.response";
import { IGetFriendRequestByIdUseCase } from "./get-friend-request-by-id.usecase";
import { GetFriendRequestByIdRequest } from "./get-friend-request-by-id.request";

/**
 * Implementation of the GetFriendRequestByIdUseCase.
 */
@injectable()
export class GetFriendRequestByIdUseCase
  implements IGetFriendRequestByIdUseCase
{
  constructor(
    @inject(TYPES.FriendRequestRepository)
    private friendRequestRepository: IFriendRequestRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    id,
  }: GetFriendRequestByIdRequest): Promise<GetFriendRequestByIdResponse> {
    try {
      const friendRequestResponse =
        await this.friendRequestRepository.getFriendRequestById(id);

      if (friendRequestResponse.error) {
        this.logger.error(`Friend request with id ${id} not found`);
        return {
          data: null,
          error: `Friend request with id ${id} not found`,
        };
      }

      return {
        data: friendRequestResponse.value,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching friend request with id ${id}: ${error.message}`
      );
      return {
        data: null,
        error: `Error fetching friend request with id ${id}: ${error.message}`,
      };
    }
  }
}
