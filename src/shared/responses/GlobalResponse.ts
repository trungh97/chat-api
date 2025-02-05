import { Field, InterfaceType, ObjectType } from "type-graphql";

@InterfaceType()
export abstract class IResponse {
  @Field(() => Number, { nullable: true })
  statusCode?: number;

  @Field(() => String, { nullable: true })
  message?: string;
}

/**
 * Generates a GraphQL response object that implements the IResponse interface.
 *
 * The generated class contains the following properties:
 *
 * - success: A boolean indicating the success or failure of the operation.
 * - statusCode?: An optional HTTP status code.
 * - message?: An optional message associated with the response.
 * - data?: The data associated with the response (optional).
 * - error?: An optional error associated with the response.
 *
 * @param {new () => T} TClass The class of the data associated with the response.
 * @returns {() => Response<T>} A constructor for the response object.
 */
export function GlobalResponse<T, IsArray extends boolean = false>(
  TClass: new () => T,
  isArray?: IsArray
) {
  @ObjectType({ implements: IResponse })
  abstract class Response extends IResponse {
    /**
     * The HTTP status code (optional).
     */
    statusCode?: number;

    /**
     * A message associated with the response (optional).
     */
    message?: string;

    /**
     * The data associated with the response (optional).
     */
    @Field(() => (isArray ? [TClass] : TClass), { nullable: true })
    data?: IsArray extends true ? T[] : T;

    /**
     * The error associated with the response (optional).
     */
    @Field(() => String, { nullable: true })
    error?: string;
  }

  return Response;
}
