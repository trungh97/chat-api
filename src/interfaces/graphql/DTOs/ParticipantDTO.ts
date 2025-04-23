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
}

@ObjectType()
export class ExtendedParticipantDTO extends ParticipantDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  avatar: string;
}
