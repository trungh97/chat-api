import { IDetailedParticipantDTO } from "@domain/dtos/participant";
import { Message } from "@domain/entities";
import { ConversationType } from "@domain/enums";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { MessageDTO } from "./MessageDTO";
import { DetailedParticipantDTO } from "./ParticipantDTO";

registerEnumType(ConversationType, {
  name: "ConversationType",
  description: "Conversation type",
});

@ObjectType()
export class ConversationDTO {
  @Field(() => ID)
  id!: string;

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
  type: keyof typeof ConversationType;

  @Field(() => Date, { nullable: true })
  lastMessageAt?: Date;
}

@ObjectType()
export class ExtendConversationDTO extends ConversationDTO {
  @Field(() => [DetailedParticipantDTO])
  participants: IDetailedParticipantDTO[];

  @Field(() => [MessageDTO])
  messages: Message[];

  @Field(() => [String], { nullable: true })
  defaultGroupAvatars?: string[];
}
