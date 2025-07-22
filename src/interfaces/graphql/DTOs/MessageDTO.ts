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
  messageType!: keyof typeof MessageType;

  @Field(() => String, { nullable: true })
  senderId?: string;

  @Field(() => String, { nullable: true })
  extra?: string;

  @Field(() => String, { nullable: true })
  conversationId: string;

  @Field(() => String, { nullable: true })
  replyToMessageId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => String, { nullable: true })
  senderName?: string;

  @Field(() => String, { nullable: true })
  senderAvatar?: string | null;
}
