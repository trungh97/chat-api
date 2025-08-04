import { Message } from "@domain/entities";
import { Field, InputType } from "type-graphql";
import { MessageCreateMutationRequest } from "./MessageCreateMutationRequest";

@InputType()
export class MessageUpdateBody
  implements Partial<MessageCreateMutationRequest>
{
  @Field(() => String, { nullable: true })
  content?: string;
}

@InputType()
export class MessageUpdateMutationRequest {
  @Field(() => String)
  id: string;

  @Field(() => MessageUpdateBody)
  updates?: Partial<Message>;
}
