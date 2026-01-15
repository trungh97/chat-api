import { Field, InputType } from "type-graphql";

@InputType()
export class BatchUpdateLastReceivedMessageRequest {
  @Field(() => String)
  participantId: string;

  @Field(() => String)
  messageId: string;
}
