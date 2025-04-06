import { ParticipantType } from "@domain/enums";
import { Field, InputType, registerEnumType } from "type-graphql";

registerEnumType(ParticipantType, {
  name: "ParticipantType",
  description: "The type of participant in a conversation",
});

@InputType()
export class ParticipantCreateMutationRequest {
  @Field(() => String)
  conversationId: string;

  @Field(() => String)
  userId: string;

  @Field(() => ParticipantType, { defaultValue: ParticipantType.MEMBER })
  type?: ParticipantType;
}
