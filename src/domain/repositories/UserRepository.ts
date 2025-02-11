import { User } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

export interface IUserRepository {
  /**
   * Retrieves the user's information based on the user id.
   *
   * @async
   * @param {string} id - The user id.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  getUserById(id: string): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the user's information based on the user email.
   *
   * @async
   * @param {string} email - The user email.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  findUserByEmail(email: string): Promise<RepositoryResponse<User, Error>>;

  /**
   * Create a new credential based user.
   *
   * @async
   * @param {User} user - The new user.
   * @returns {Promise<RepositoryResponse<User, Error>>} The new user.
   */
  createCredentialBasedUser(
    user: User
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Create a new federated credential user.
   *
   * @async
   * @param {User} user - The new user.
   * @returns {Promise<RepositoryResponse<User, Error>>} The new user.
   */
  createFederatedCredentialUser(
    user: User
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the credential based user's information based on the user id.
   *
   * @async
   * @param {string} id - The user id.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  getCredentialBasedUserById(
    id: string
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the federated credential user's information based on the user id.
   *
   * @async
   * @param {string} id - The user id.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  getFederatedCredentialUserById(
    id: string
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the user names with the given IDs.
   *
   * @param {string[]} userIds - An array of unique identifiers of the users.
   * @returns {Promise<RepositoryResponse<string[], Error>>} A promise resolving to an array of names of the users.
   */
  getUserNamesByIds(userIds: string[]): Promise<
    RepositoryResponse<
      {
        id: string;
        firstName: string;
        lastName: string;
      }[],
      Error
    >
  >;
}
