import { Conversation, Message } from "@domain/entities";
import { ExtendedParticipant } from "../participant/types";

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

export type ConversationUseCaseResponse = {
  conversation: ExtendedConversation;
  participants?: ExtendedParticipant[];
  messages?: Message[];
};
