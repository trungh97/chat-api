import { ParticipantType } from "@domain/enums";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

registerEnumType(ParticipantType, {
  name: "ParticipantType",
  description: "Participant type",
});

@ObjectType()
export class ParticipantDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  conversationId: string;

  @Field(() => String)
  userId: string;

  @Field(() => ParticipantType)
  type: keyof typeof ParticipantType;

  @Field(() => String, { nullable: true })
  lastSeenMessageId?: string;

  @Field(() => Date, { nullable: true })
  lastSeenAt?: Date;

  @Field(() => String, { nullable: true })
  lastReceivedMessageId?: string;

  @Field(() => Date, { nullable: true })
  lastSeenMessageAt?: Date;

  @Field(() => Date, { nullable: true })
  lastReceivedMessageAt?: Date;
}

@ObjectType()
export class DetailedParticipantDTO extends ParticipantDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  avatar: string;
}

@ObjectType()
export class LastReceivedMessageUpdateBodyDTO {
  @Field(() => String)
  conversationId: string;

  @Field(() => String)
  participantId: string;

  @Field(() => String)
  messageId: string;

  @Field(() => Date)
  messageCreatedAt: Date;
}

@ObjectType()
export class LastSeenMessageUpdateBodyDTO extends LastReceivedMessageUpdateBodyDTO {
  @Field(() => Date)
  lastSeenAt: Date;
}
