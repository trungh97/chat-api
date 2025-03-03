import { FriendRequest } from "@domain/entities";
import { FriendRequestStatus } from "@domain/enums";
import { RepositoryResponse } from "@shared/responses";

export interface IFriendRequestRepository {
  /**
   * Creates a new friend request.
   *
   * @async
   * @param {FriendRequest} friendRequest - The new friend request.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The new friend request.
   */
  createFriendRequest(
    friendRequest: FriendRequest
  ): Promise<RepositoryResponse<FriendRequest, Error>>;

  /**
   * Changes the friend request's status.
   *
   * @async
   * @param {string} id - The friend request id.
   * @param {FriendRequestStatus} status - The new status.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The updated friend request.
   */
  changeFriendRequestStatus(
    id: string,
    status: FriendRequestStatus
  ): Promise<RepositoryResponse<FriendRequest, Error>>;

  /**
   * Deletes the friend request based on the friend request id.
   *
   * @async
   * @param {string} id - The friend request id.
   * @returns {Promise<RepositoryResponse<boolean, Error>>} The result of the deletion.
   */
  deleteFriendRequest(id: string): Promise<RepositoryResponse<boolean, Error>>;

  /**
   * Retrieves the friend requests' information based on the user id.
   *
   * @async
   * @param {string} userId - The user id.
   * @returns {Promise<RepositoryResponse<FriendRequest[], Error>>} The friend requests' information.
   */
  getFriendRequestsByUserId(
    userId: string
  ): Promise<RepositoryResponse<FriendRequest[], Error>>;

  /**
   * Retrieves the friend request's information based on the friend request id.
   *
   * @async
   * @param {string} id - The friend request id.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The friend request's information.
   */
  getFriendRequestById(
    id: string
  ): Promise<RepositoryResponse<FriendRequest, Error>>;

  /**
   * Retrieves the friend request's information based on the sender id and receiver id.
   *
   * @async
   * @param {string} senderId - The sender id.
   * @param {string} receiverId - The receiver id.
   * @returns {Promise<RepositoryResponse<FriendRequest, Error>>} The friend request's information.
   */
  getFriendRequestByUsers(
    senderId: string,
    receiverId: string
  ): Promise<RepositoryResponse<FriendRequest, Error>>;

  /**
   * Finds declined friend requests older than the specified days.
   *
   * @async
   * @param {number} days - The day to compare.
   * @returns {Promise<RepositoryResponse<FriendRequest[], Error>>} The declined friend requests older than the specified timestamp.
   */
  findDeclinedFriendRequestsOlderThan(
    days: number
  ): Promise<RepositoryResponse<FriendRequest[], Error>>;
}
