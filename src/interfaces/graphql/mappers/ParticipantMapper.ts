import { Participant } from "@domain/entities/Participant";
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
    return participant;
  }

  /**
   * Converts a ParticipantDTO to a Participant domain entity.
   * @param participantDTO - The ParticipantDTO to convert.
   * @returns The corresponding Participant domain entity.
   */
  static toDomain(participantDTO: ParticipantDTO): Participant {
    return new Participant({
      ...participantDTO,
      type: participantDTO.type,
    });
  }
}
