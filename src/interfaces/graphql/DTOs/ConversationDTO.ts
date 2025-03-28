import { ConversationType } from "@domain/enums";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";

registerEnumType(ConversationType, {
  name: "ConversationType",
  description: "Conversation type",
});

@ObjectType()
export class ConversationDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  creatorId: string;

  @Field(() => Boolean)
  isArchived: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @Field(() => ConversationType)
  type: ConversationType;
}
