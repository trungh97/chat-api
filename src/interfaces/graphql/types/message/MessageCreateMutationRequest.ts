import { MessageType } from "@domain/enums";
import { Field, InputType, registerEnumType } from "type-graphql";

registerEnumType(MessageType, {
  name: "MessageType",
  description: "Message type",
});

@InputType()
export class MessageCreateMutationRequest {
  @Field(() => String, { nullable: true })
  conversationId?: string;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  extra?: string;

  @Field(() => MessageType)
  messageType: MessageType;

  @Field(() => String, { nullable: true })
  replyToMessageId?: string;

  @Field(() => [String], { nullable: true })
  receivers?: string[];
}
