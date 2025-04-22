import { Message, Participant } from "@domain/entities";
import { ConversationType } from "@domain/enums";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { ParticipantDTO } from "./ParticipantDTO";
import { MessageDTO } from "./MessageDTO";

registerEnumType(ConversationType, {
  name: "ConversationType",
  description: "Conversation type",
});

@ObjectType()
export class ConversationDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  groupAvatar?: string;

  @Field(() => String)
  creatorId: string;

  @Field(() => Boolean)
  isArchived: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @Field(() => ConversationType)
  type: ConversationType;
}

@ObjectType()
export class ExtendConversationDTO extends ConversationDTO {
  @Field(() => [ParticipantDTO])
  participants: Participant[];

  @Field(() => [MessageDTO])
  messages: Message[];

  @Field(() => [String], { nullable: true })
  defaultGroupAvatar?: string[];
}
