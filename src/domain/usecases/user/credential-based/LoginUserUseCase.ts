import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export type ILoginCredentialBasedUserRequestDTO = Pick<
  ICreateUserRequestDTO,
  "email" | "password"
>;

export interface ILoginCredentialBasedUserUseCase {
  /**
   * Executes the login credential based user use case.
   *
   * @async
   * @param {ILoginCredentialBasedUserRequestDTO} request - The request data.
   * @returns {Promise<UseCaseResponse<User>>} The response data.
   */
  execute(request: ILoginCredentialBasedUserRequestDTO): Promise<UseCaseResponse<User>>;
}
