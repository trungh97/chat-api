import { ObjectType, Field, ID } from "type-graphql";

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

  @Field(() => Date)
  deletedAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
