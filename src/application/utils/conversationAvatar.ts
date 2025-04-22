import { ExtendedParticipant } from "@domain/dtos/participant";

/**
 * Returns an array of avatar urls of the conversation, based on the participants.
 *
 * The returned array will contain at most 2 avatars, which are the avatars of the participants
 * that are not the current participant.
 *
 * @param {{ currentParticipant: string; allParticipants: ShortParticipantType[]; }} options
 * @param {string} options.currentParticipant - The id of the current participant.
 * @param {ShortParticipantType[]} options.allParticipants - An array of participant objects with their id and avatar.
 *
 * @returns {string[]} An array of avatar urls of the conversation.
 */
export const getDefaultConversationAvatar = (options: {
  currentParticipant: string;
  allParticipants: ExtendedParticipant[];
}): string[] => {
  const { currentParticipant, allParticipants } = options;

  const otherAvatars = allParticipants
    .filter((p) => p.userId !== currentParticipant)
    .map((p) => p.avatar);

  return otherAvatars.slice(0, 2);
};

/**
 * Returns the avatar(s) of the conversation based on the participants.
 *
 * If the group conversation has a custom avatar, returns that.
 * Otherwise, returns up to 2 avatars of the other participants, or an empty array if there are no other participants.
 *
 * @param {{ currentParticipant: string; allParticipants: ShortParticipantType[]; customGroupAvatar?: string }} options
 * @param {string} options.currentParticipant - The id of the current participant.
 * @param {ShortParticipantType[]} options.allParticipants - An array of participant objects with their id and avatar.
 * @param {string} [options.customGroupAvatar] - An optional custom group avatar.
 *
 * @returns {string[]} An array of avatar urls.
 */
export const getConversationAvatar = (options: {
  currentParticipant: string;
  allParticipants: ExtendedParticipant[];
  customGroupAvatar?: string;
}): string[] => {
  const { currentParticipant, allParticipants, customGroupAvatar } = options;

  // If the group conversation has a custom avatar, use that
  if (customGroupAvatar) return [];

  const otherAvatars = getDefaultConversationAvatar({
    currentParticipant,
    allParticipants,
  });

  return otherAvatars;
};
