/**
 * Data Transfer Object (DTO) representing a response from the application.
 *
 * @interface
 */
export interface GlobalResponse<T> {
  /**
   * A boolean indicating the success or failure of the operation.
   */
  success: boolean;

  /**
   * The data associated with the response.
   */
  data: T;

  /**
   * The HTTP status code (optional).
   */
  statusCode?: number;

  /**
   * A message associated with the response (optional).
   */
  message?: string;

  /**
   * The error associated with the response (optional).
   */
  error?: string;
}
