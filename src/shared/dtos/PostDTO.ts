/**
 * Data Transfer Object (DTO) representing the post data.
 *
 * @interface
 */
export interface PostDTO {
  /**
   * The ID of the post.
   */
  id: string;

  /**
   * The title of the post.
   */
  title: string;

  /**
   * The content of the post.
   */
  content: string;
}
