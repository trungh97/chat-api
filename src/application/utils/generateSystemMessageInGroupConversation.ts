import { SystemMessageType } from "@domain/enums";

const systemMessageMap: Record<SystemMessageType, string> = {
  [SystemMessageType.PARTICIPANT_JOINED]: "{user} has joined the group",
  [SystemMessageType.PARTICIPANT_LEFT]: "{user} has left the group",
};

/**
 * Generates a system message for a group conversation given the type and user.
 *
 * @param {SystemMessageType} systemMessageType - The type of system message
 * @param {string} user - The user who triggered the message
 * @returns {string} The generated system message
 */
export const generateSystemMessageInGroupConversation = (
  systemMessageType: SystemMessageType,
  user: string
) => {
  return systemMessageMap[systemMessageType].replace("{user}", user);
};
