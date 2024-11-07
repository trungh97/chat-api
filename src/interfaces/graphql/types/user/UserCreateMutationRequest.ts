import { Field, InputType } from "type-graphql";

@InputType()
export class UserCreateMutationRequest {
  @Field(() => String)
  email!: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  phone?: string;

  @Field(() => String, { nullable: true })
  avatar?: string;
}
