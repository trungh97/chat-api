import { Message } from "@domain/entities";

export interface IUpdateMessageRequestDTO {
  id: string;
  updates: Partial<Message>;
}

export type UpdateMessageRequest = IUpdateMessageRequestDTO & {
  userId: string;
};
