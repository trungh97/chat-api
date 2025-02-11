import { Field, InputType } from "type-graphql";

@InputType()
export class ConversationCreateMutationRequest {
  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => [String])
  participants: string[];
}
