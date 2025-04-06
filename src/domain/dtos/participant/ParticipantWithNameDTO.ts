import { Participant } from "@domain/entities";

export class ParticipantWithNameDTO extends Participant {
  name: string;

  constructor(participant: Participant, name: string) {
    super(participant);
    this.name = name;
  }
}
