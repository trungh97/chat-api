import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export interface IRegisterCredentialBasedUserUseCase {
  /**
   * Executes the register credential based user use case.
   *
   * @async
   * @param {ICreateUserRequestDTO} request - The request data.
   * @returns {Promise<UseCaseResponse<User>>} The response data.
   */
  execute(request: ICreateUserRequestDTO): Promise<UseCaseResponse<User>>;
}
