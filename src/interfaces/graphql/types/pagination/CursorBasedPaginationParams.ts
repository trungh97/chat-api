import { Field, InputType } from "type-graphql";

@InputType()
export class CursorBasedPaginationParams {
  @Field(() => String, { nullable: true })
  cursor?: string;

  @Field(() => Number)
  limit: number;
}
