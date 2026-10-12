import { Field, InputType } from "type-graphql";

@InputType()
export class BatchUpdateLastReceivedMessageRequest {
  @Field(() => String)
  conversationId: string;

  @Field(() => String)
  messageId: string;
}
