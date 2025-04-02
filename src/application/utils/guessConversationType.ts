import { ConversationType } from "@domain/enums";

/**
 * Guesses the type of the conversation based on the number of participants.
 * @param {string[]} participantIds - The IDs of the participants in the conversation.
 * @returns {ConversationType | null} The type of the conversation, or null if it cannot be determined.
 */
export const guessConversationType = (
  participantIds: string[]
): ConversationType | null => {
  const isPrivate = participantIds.length === 2;
  const isGroup = participantIds.length > 2 && participantIds.length <= 100;
  if (isPrivate) return ConversationType.PRIVATE;
  if (isGroup) return ConversationType.GROUP;
  return null;
};
