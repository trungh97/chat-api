import { PostDTO } from "@shared/dtos";
import { Post as PostEntity } from "@domain/entities";
import { Post, Post as PostModel } from "@prisma/client";

export class PostMapper {
  /**
   * Maps a Post entity to a PostDTO.
   *
   * @param post - The Post entity to map.
   * @returns {PostDTO} - The mapped PostDTO.
   */
  static toDTO(post: PostEntity): PostDTO {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
    };
  }

  /**
   * Maps a PostDTO to a Post entity.
   *
   * @param postDTO - The PostDTO to map.
   * @returns {Post} - The mapped Post entity.
   */
  static toDomain(postDTO: PostDTO): PostEntity {
    return new PostEntity(postDTO.id, postDTO.title, postDTO.content);
  }

  static toPrisma(post: PostEntity): PostModel {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Maps a Post entity retrieved from the persistence layer to a Post entity.
   *
   * @param {Post} post - The Post entity retrieved from the persistence layer.
   * @returns {PostEntity} - The mapped Post entity.
   */
  static toDomainFromPersistence(post: Post): PostEntity {
    return new PostEntity(post.id, post.title, post.content);
  }
}
