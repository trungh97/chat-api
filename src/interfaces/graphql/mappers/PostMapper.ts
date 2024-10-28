import { Post } from "@domain/entities";
import { PostDTO } from "../DTOs/PostDTO";

export class PostMapper {
  /**
   * Converts a Post entity to a PostDTO.
   *
   * @param {Post} post - The Post entity to be converted.
   * @returns {PostDTO} - The resulting PostDTO.
   */
  static toDTO(post: Post): PostDTO {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
    };
  }

  /**
   * Converts a PostDTO to a Post entity.
   *
   * @param {PostDTO} postDTO - The PostDTO to be converted.
   * @returns {Post} - The resulting Post entity.
   */
  static toEntity(postDTO: PostDTO): Post {
    return new Post(postDTO.id, postDTO.title, postDTO.content);
  }
}
