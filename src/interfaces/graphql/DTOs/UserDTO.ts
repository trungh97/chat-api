import { UserRole, UserStatus } from "@domain/enums";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

registerEnumType(UserRole, { name: "UserRole", description: "User role" });
registerEnumType(UserStatus, {
  name: "UserStatus",
  description: "User status",
});

@ObjectType()
export class UserDTO {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  password: string;

  @Field(() => UserRole)
  role: keyof typeof UserRole;

  @Field(() => String)
  phone: string;

  @Field(() => String)
  avatar: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => UserStatus)
  status: keyof typeof UserStatus;
}
