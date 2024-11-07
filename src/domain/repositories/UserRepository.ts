import { User } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

export interface IUserRepository {
  /**
   * Retrieves the user's information based on the authenticated user.
   * If the user is not authenticated, it throws an error.
   *
   * @async
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  getMe(): Promise<RepositoryResponse<User, Error>>;

  /**
   * Create a new user.
   *
   * @async
   * @param {User} user - The new user.
   * @returns {Promise<RepositoryResponse<User, Error>>} The new user.
   */
  createUser(user: User): Promise<RepositoryResponse<User, Error>>;
}
