import { ICreateFriendRequestDTO } from "@domain/dtos/friendRequest";
import { FriendRequest } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

/**
 * Interface for the CreateFriendRequestUseCase.
 */
export interface ICreateFriendRequestUseCase {
  /**
   * Executes the use case.
   *
   * @param {ICreateFriendRequestDTO} request - The request object.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The response object.
   */
  execute(
    request: ICreateFriendRequestDTO
  ): Promise<RepositoryResponse<FriendRequest, Error>>;
}
