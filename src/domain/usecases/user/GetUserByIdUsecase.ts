import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export interface IGetUserByIdUsecase {
  /**
   * Executes the get user info by id use case.
   *
   * @async
   * @param {string} id - The request user id.
   * @returns {Promise<UseCaseResponse<User>>} The response data.
   */
  execute(id: string): Promise<UseCaseResponse<User>>;
}
