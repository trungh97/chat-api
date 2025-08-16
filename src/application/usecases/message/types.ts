import { Conversation, Message } from "@domain/entities";

type SenderProps = {
  name: string;
  avatar?: string | null;
};

export class MessageWithSenderUseCaseDTO extends Message {
  private _sender: SenderProps;

  get sender(): SenderProps {
    return this._sender;
  }

  set sender(sender: SenderProps) {
    this._sender = sender;
  }

  constructor(message: Message, sender: SenderProps) {
    super(message);
    this.sender = sender;
  }
}

export class MessageWithConversationUseCaseDTO extends Message {
  private _conversation: Conversation;

  get conversation(): Conversation {
    return this._conversation;
  }

  constructor(message: Message, conversation: Conversation) {
    super(message);
    this._conversation = conversation;
  }
}
