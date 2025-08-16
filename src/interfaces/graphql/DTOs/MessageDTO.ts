import { Conversation } from "@domain/entities";
import { MessageType } from "@domain/enums";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { ConversationDTO } from "./ConversationDTO";

registerEnumType(MessageType, {
  name: "MessageType",
  description: "Message type",
});

@ObjectType()
export class MessageDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => MessageType)
  messageType!: keyof typeof MessageType;

  @Field(() => String, { nullable: true })
  senderId?: string;

  @Field(() => String, { nullable: true })
  extra?: string;

  @Field(() => String)
  conversationId: string;

  @Field(() => String, { nullable: true })
  replyToMessageId?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class MessageWithSenderDTO extends MessageDTO {
  @Field(() => String, { nullable: true })
  senderName?: string;

  @Field(() => String, { nullable: true })
  senderAvatar?: string | null;
}

@ObjectType()
export class MessageWithConversationDTO extends MessageDTO {
  @Field(() => ConversationDTO)
  conversation: Conversation;
}
