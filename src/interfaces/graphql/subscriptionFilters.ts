import { Context } from "types";

/**
 * Subscription filter that only delivers an event to the users listed in its `recipientUserIds`,
 * normally the participants of the conversation the event belongs to.
 */
export const isRecipient = ({
  payload,
  context,
}: {
  payload: { recipientUserIds?: string[] };
  context: Context;
}): boolean => {
  const userId = context.req?.session?.userId;
  return !!userId && !!payload.recipientUserIds?.includes(userId);
};
