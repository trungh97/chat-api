import { Field, InputType } from "type-graphql";

@InputType()
export class ContactCreateMutationRequest {
  @Field(() => String)
  contactId: string;
}
