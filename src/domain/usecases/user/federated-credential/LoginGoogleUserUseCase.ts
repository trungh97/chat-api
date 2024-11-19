import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export interface ILoginGoogleUserUseCase {
  /**
   * Executes the login google user use case.
   *
   * @async
   * @param {string} code - The request authorization code.
   * @returns {Promise<UseCaseResponse<User>>} The response data.
   */
  execute(code: string): Promise<UseCaseResponse<User>>;
}
