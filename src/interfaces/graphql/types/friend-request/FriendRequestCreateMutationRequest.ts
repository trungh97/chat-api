import { InputType, Field } from "type-graphql";

@InputType()
export class FriendRequestCreateMutationRequest {
  @Field(() => String)
  receiverId: string;
}
