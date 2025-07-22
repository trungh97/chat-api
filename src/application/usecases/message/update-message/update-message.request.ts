import { Message } from "@domain/entities";

export type UpdateMessageRequest = {
  id: string;
  updates: Partial<Message>;
};
