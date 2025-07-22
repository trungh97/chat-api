import { FriendRequest } from "@domain/entities";
import { FriendRequestDTO } from "../dtos/FriendRequestDTO";

/**
 * Mapper class for converting between FriendRequest entities and FriendRequestDTOs.
 */
export class FriendRequestMapper {
  /**
   * Converts a FriendRequest entity to a FriendRequestDTO.
   *
   * @param {FriendRequest} friendRequest - The FriendRequest entity to be converted.
   * @returns {FriendRequestDTO} - The resulting FriendRequestDTO.
   */
  static toDTO(friendRequest: FriendRequest): FriendRequestDTO {
    return {
      id: friendRequest.id,
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
      status: friendRequest.status,
    };
  }

  /**
   * Converts a FriendRequestDTO to a FriendRequest entity.
   *
   * @param {FriendRequestDTO} friendRequestDTO - The FriendRequestDTO to be converted.
   * @returns {FriendRequest} - The resulting FriendRequest entity.
   */
  static toEntity(friendRequestDTO: FriendRequestDTO): FriendRequest {
    const friendRequest = {
      id: friendRequestDTO.id,
      senderId: friendRequestDTO.senderId,
      receiverId: friendRequestDTO.receiverId,
      status: friendRequestDTO.status,
    };
    return new FriendRequest(friendRequest);
  }
}
