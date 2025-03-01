import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { FriendRequestStatus } from "@domain/enums";

registerEnumType(FriendRequestStatus, {
  name: "FriendRequestStatus",
  description: "Friend request status",
});

@ObjectType()
export class FriendRequestDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  senderId: string;

  @Field(() => String)
  receiverId: string;

  @Field(() => FriendRequestStatus)
  status: FriendRequestStatus;
}
