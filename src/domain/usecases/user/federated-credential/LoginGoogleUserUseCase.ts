import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export interface ILoginGoogleUserUseCase {
  /**
   * Executes the login google user use case.
   *
   * @async
   * @param {string} idToken - The request google id token.
   * @returns {Promise<UseCaseResponse<User>>} The response data.
   */
  execute(idToken: string): Promise<UseCaseResponse<User>>;
}
