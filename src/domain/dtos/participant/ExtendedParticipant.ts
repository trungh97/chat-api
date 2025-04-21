import { Participant } from "@domain/entities";

export class ExtendedParticipant extends Participant {
  name: string;
  avatar: string;

  constructor(participant: Participant, name: string, avatar?: string) {
    super(participant);
    this.name = name;
    this.avatar = avatar;
  }
}
