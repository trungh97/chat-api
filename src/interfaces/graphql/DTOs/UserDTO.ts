import { UserProvider, UserRole, UserStatus } from "@domain/enums";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

registerEnumType(UserRole, { name: "UserRole", description: "User role" });
registerEnumType(UserStatus, {
  name: "UserStatus",
  description: "User status",
});
registerEnumType(UserProvider, {
  name: "UserProvider",
  description: "User provider",
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

  @Field(() => UserRole)
  role: keyof typeof UserRole;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String)
  avatar: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => UserStatus)
  status: keyof typeof UserStatus;

  @Field(() => UserProvider, { nullable: true })
  provider?: keyof typeof UserProvider;

  @Field(() => String, { nullable: true })
  providerUserId?: string;
}
