import { MessageType } from "@domain/enums";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

registerEnumType(MessageType, {
  name: "MessageType",
  description: "Message type",
});

@ObjectType()
export class MessageDTO {
  @Field((type) => ID)
  id!: string;

  @Field(() => String)
  content!: string;

  @Field(() => MessageType)
  messageType!: MessageType;

  @Field(() => String)
  senderId!: string;

  @Field(() => String, { nullable: true })
  extra?: string;

  @Field(() => String)
  conversationId!: string;

  @Field(() => String, { nullable: true })
  replyToMessageId?: string;

  @Field(() => Date)
  createdAt: Date;
}
