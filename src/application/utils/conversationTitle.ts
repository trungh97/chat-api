import { ParticipantWithNameDTO } from "@domain/dtos/participant";
import { Participant } from "@domain/entities";

type ShortParticipantType = Pick<ParticipantWithNameDTO, "id" | "name">;

/**
 * Generates a default conversation title based on the names of the participants.
 *
 * If there is only one other participant, returns their name.
 * If there are multiple participants, returns up to 3 names separated by commas, followed by "..." if there are more than 3.
 * If there are no other participants, returns "You"
 *
 * @param {{ currentParticipant: string; allParticipants: ShortParticipantType[]; }} options
 * @param {string} options.currentParticipant - The id of the current participant.
 * @param {ShortParticipantType[]} options.allParticipants - An array of participant objects with their id and name.
 *
 * @returns {string} A string representing the default title of the conversation.
 */
export const buildDefaultConversationTitle = (options: {
  currentParticipant: string;
  allParticipants: ShortParticipantType[];
}) => {
  const { currentParticipant, allParticipants } = options;
  const otherNames = allParticipants
    .filter((p) => p.id !== currentParticipant)
    .map((p) => p.name);

  if (otherNames.length === 0) return "You";
  if (otherNames.length === 1) return otherNames[0];

  // Return up to 3 names for compact display
  const names = otherNames.slice(0, 3).join(", ");
  const suffix = otherNames.length > 3 ? "..." : "";

  return `${names}${suffix}`;
};

/**
 * Returns the title of a conversation based on the participants.
 *
 * If the current participant has set a custom title, returns that.
 * Otherwise, returns the default title generated using buildDefaultConversationTitle.
 *
 * @param {{ currentParticipant: Participant; allParticipants: ParticipantWithNameDTO[]; }} options
 * @param {Participant} options.currentParticipant - The current participant.
 * @param {ParticipantWithNameDTO[]} options.allParticipants - An array of all participants in the conversation.
 *
 * @returns {string} The title of the conversation.
 */
export function getConversationTitle(options: {
  currentParticipant: Participant;
  allParticipants: ParticipantWithNameDTO[];
}): string {
  const { currentParticipant, allParticipants } = options;
  if (currentParticipant.customTitle) return currentParticipant.customTitle;

  const defaultTitle = buildDefaultConversationTitle({
    currentParticipant: currentParticipant.id,
    allParticipants,
  });

  return defaultTitle;
}
