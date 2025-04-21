import { Conversation, Message } from "@domain/entities";
import { ExtendedParticipant } from "../participant";

export class ExtendedConversation extends Conversation {
  private defaultGroupAvatars?: string[] = [];

  constructor(conversation: Conversation, defaultGroupAvatars?: string[]) {
    super(conversation);

    this.defaultGroupAvatars = defaultGroupAvatars;
  }

  get defaultGroupAvatar(): string[] | undefined {
    return this.defaultGroupAvatars;
  }

  set defaultGroupAvatar(defaultGroupAvatars: string[] | undefined) {
    this.defaultGroupAvatars = defaultGroupAvatars;
  }
}

export interface IConversationResponseDTO {
  conversation: ExtendedConversation | Conversation;
  participants?: ExtendedParticipant[];
  messages?: Message[];
}
