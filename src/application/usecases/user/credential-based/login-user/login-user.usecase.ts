import { LoginCredentialBasedUserRequest } from "./login-user.request";
import { LoginCredentialBasedUserResponse } from "./login-user.response";

export interface ILoginCredentialBasedUserUseCase {
  execute(
    request: LoginCredentialBasedUserRequest
  ): Promise<LoginCredentialBasedUserResponse>;
}
