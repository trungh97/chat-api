import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export interface ILoginFederatedCredentialUserUseCase {
  /**
   * Executes the login federated credential user use case.
   *
   * @async
   * @param {ICreateUserRequestDTO} request - The request data.
   * @returns {Promise<UseCaseResponse<User>>} The response data.
   */
  execute(request: ICreateUserRequestDTO): Promise<UseCaseResponse<User>>;
}
