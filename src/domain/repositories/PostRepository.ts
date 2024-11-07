import { Post } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

export interface IPostRepository {
  /**
   * Find all posts with given params
   *
   * @async
   * @param params - search params
   * @returns {Promise<Post[]>} - The posts data.
   */
  findAll(params): Promise<Post[]>;

  /**
   * Count all posts with given params
   *
   * @async
   * @param params - search params
   * @returns {Promise<number>} - The number of posts.
   */
  countAll(params): Promise<number>;

  /**
   * Find post by ID
   *
   * @async
   * @param id - The ID of the post.
   * @returns {Promise<Post>} - The post data.
   */
  findById(id: string): Promise<RepositoryResponse<Post, Error>>;

  /**
   * Create new post
   *
   * @async
   * @param post - The new post data.
   * @returns {Promise<Post>} - The created post data.
   */
  create(post: Post): Promise<Post>;

  /**
   * Update post
   *
   * @async
   * @param post - The updated post data.
   * @returns {Promise<Post>} - The updated post data.
   */
  updateById(post: Post): Promise<Post>;

  /**
   * Delete post
   *
   * @async
   * @param id - The ID of the post.
   * @returns {Promise<void>}
   */
  deleteById(id: string): Promise<void>;
}
