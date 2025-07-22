import { LoginGoogleUserRequest } from "./login-google-user.request";
import { LoginGoogleUserResponse } from "./login-google-user.response";

export interface ILoginGoogleUserUseCase {
  execute(request: LoginGoogleUserRequest): Promise<LoginGoogleUserResponse>;
}
