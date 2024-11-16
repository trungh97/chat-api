import { User } from "@domain/entities";
import { UserDTO } from "../DTOs";

export class UserMapper {
  /**
   * Converts a User entity to a UserDTO.
   *
   * @param {User} user - The User entity to be converted.
   * @returns {UserDTO} - The resulting UserDTO.
   */
  static toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar || "",
      isActive: user.isActive,
      status: user.status,
      provider: user.provider,
      providerUserId: user.providerUserId,
    };
  }

  /**
   * Converts a UserDTO to a User entity.
   *
   * @param {UserDTO} userDTO - The UserDTO to be converted.
   * @returns {User} - The resulting User entity.
   */
  static toEntity(userDTO: UserDTO): User {
    return new User(userDTO);
  }
}
