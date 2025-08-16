export interface ICreateConversationRequestDTO {
  title?: string;
  lastMessageAt?: Date;
  participants: string[];
}
