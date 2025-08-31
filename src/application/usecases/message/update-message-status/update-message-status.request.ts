import { Message } from "@domain/entities";

export interface IUpdateMessageStatusRequestDTO {
  id: string;
  status: Message["status"];
  currentUserId: string;
}

export type UpdateMessageStatusRequest = IUpdateMessageStatusRequestDTO;
