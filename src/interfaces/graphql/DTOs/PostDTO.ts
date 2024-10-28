import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class PostDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;
}
