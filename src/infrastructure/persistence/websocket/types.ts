import { MessageProps } from "@domain/entities";
import { Topic } from "./topics";

export type PubSubProps = {
  [Topic.NEW_MESSAGE]: [MessageProps];
};
