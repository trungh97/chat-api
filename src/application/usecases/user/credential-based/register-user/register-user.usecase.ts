import { RegisterCredentialBasedUserRequest } from "./register-user.request";
import { RegisterCredentialBasedUserResponse } from "./register-user.response";

export interface IRegisterCredentialBasedUserUseCase {
  /**
   * Executes the register user use case.
   *
   * @param {RegisterCredentialBasedUserRequest} request - The request data.
   * @returns {Promise<RegisterCredentialBasedUserResponse>} The response data.
   */
  execute(
    request: RegisterCredentialBasedUserRequest
  ): Promise<RegisterCredentialBasedUserResponse>;
}
