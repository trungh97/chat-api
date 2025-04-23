import { ExtendedParticipant } from "@domain/dtos/participant";
import { Message } from "@domain/entities";
import { ConversationType } from "@domain/enums";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { MessageDTO } from "./MessageDTO";
import { ExtendedParticipantDTO } from "./ParticipantDTO";

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
  @Field(() => [ExtendedParticipantDTO])
  participants: ExtendedParticipant[];

  @Field(() => [MessageDTO])
  messages: Message[];

  @Field(() => [String], { nullable: true })
  defaultGroupAvatar?: string[];
}
