import { Participant } from "@domain/entities/Participant";
import { ParticipantType } from "@domain/enums";
import { ParticipantDTO } from "../dtos/ParticipantDTO";

/**
 * Mapper for converting between Participant domain entities and ParticipantDTOs.
 */
export class ParticipantMapper {
  /**
   * Converts a Participant domain entity to a ParticipantDTO.
   * @param participant - The Participant domain entity to convert.
   * @returns The corresponding ParticipantDTO.
   */
  static toDTO(participant: Participant): ParticipantDTO {
    return {
      id: participant.id,
      conversationId: participant.conversationId,
      userId: participant.userId,
      type: participant.type,
    };
  }

  /**
   * Converts a ParticipantDTO to a Participant domain entity.
   * @param participantDTO - The ParticipantDTO to convert.
   * @returns The corresponding Participant domain entity.
   */
  static toDomain(participantDTO: ParticipantDTO): Participant {
    return new Participant({
      id: participantDTO.id,
      conversationId: participantDTO.conversationId,
      userId: participantDTO.userId,
      type: participantDTO.type as ParticipantType,
    });
  }
}
