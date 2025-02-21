import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class ContactDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  contactId: string;

  @Field(() => String)
  contactName: string;
}
