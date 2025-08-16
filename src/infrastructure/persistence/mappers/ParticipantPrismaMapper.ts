import { IDetailedParticipantDTO } from "@domain/dtos";
import { Participant } from "@domain/entities";
import { Participant as ParticipantPrismaModel } from "@prisma/client";

export class ParticipantPrismaMapper {
  /**
   * Maps a ParticipantPrismaModel to Participant entity.
   * @param prismaModel - The ParticipantPrismaModel to map.
   * @returns The corresponding Participant entity.
   */
  static fromPrismaModelToEntity(
    prismaModel: ParticipantPrismaModel
  ): Participant {
    return new Participant(prismaModel);
  }

  /**
   * Maps a ParticipantPrismaModel to IDetailedParticipantDTO.
   * @param prismaModel - The ParticipantPrismaModel to map.
   * @returns The corresponding IDetailedParticipantDTO. The "name" property is set to the concatenation
   *          of the user's first and last name, and the "avatar" property is set to the user's avatar.
   */
  static fromPrismaModelToDetailDTO(
    prismaModel: ParticipantPrismaModel & {
      user?: { firstName: string; lastName: string; avatar: string };
    }
  ): IDetailedParticipantDTO {
    return {
      ...prismaModel,
      name: `${prismaModel.user?.firstName} ${prismaModel.user?.lastName}`,
      avatar: prismaModel.user?.avatar,
    };
  }
}
