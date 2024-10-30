import { Field, InterfaceType, ObjectType } from "type-graphql";

@InterfaceType()
export abstract class IResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => Number, { nullable: true })
  statusCode?: number;

  @Field(() => String, { nullable: true })
  message?: string;
}

export function GlobalResponse<T>(TClass: new () => T) {
  @ObjectType({ implements: IResponse })
  abstract class Response extends IResponse {
    /**
     * A boolean indicating the success or failure of the operation.
     */
    success: boolean;

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
    @Field(() => TClass, { nullable: true })
    data?: T;

    /**
     * The error associated with the response (optional).
     */
    @Field(() => String,{ nullable: true })
    error?: string;
  }

  return Response;
}
