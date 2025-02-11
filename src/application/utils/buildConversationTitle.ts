/**
 * Builds a conversation title based on the given participants and creator.
 * If the initialTitle is provided, it will be used as the conversation title.
 * If the conversation has only 2 participants, it returns the name of the other participant.
 * If the conversation has more participants, it returns a concatenated string of names.
 * @param {Array<{id: string; name: string}>} participants - The participants of the conversation
 * @param {string} creatorId - The id of the conversation creator
 * @param {string} [initialTitle] - The initial title of the conversation
 * @returns {string} - The built conversation title
 */
export const buildConversationTitle = (
  participants: { id: string; name: string }[],
  creatorId: string,
  initialTitle?: string
): string => {
  if (initialTitle) return initialTitle;

  // For one-to-one chat, return the name of the other participant
  if (participants.length === 2) {
    const otherParticipant = participants.find((p) => p.id !== creatorId);
    return otherParticipant ? otherParticipant.name : "Unknown Conversation";
  }

  // For group chat, concatenate names
  return participants.map((p) => p.name).join(", ");
};
