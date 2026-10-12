import { Participant } from "@domain/entities";
import {
  IMessageRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { UseCaseResponse } from "@shared/responses";

export type PointerTargetRequest = {
  userId: string;
  conversationId: string;
  messageId: string;
};

export type PointerTarget = {
  /** The acting user's participant record in the conversation. */
  participant: Participant;
  messageCreatedAt: Date;
};

/**
 * Resolves what a last seen/received pointer update applies to. The participant is always the
 * acting user's own, which also checks that the user belongs to the conversation, and the message
 * must belong to that conversation.
 */
export const resolvePointerTarget = async (
  participantRepository: IParticipantRepository,
  messageRepository: IMessageRepository,
  { userId, conversationId, messageId }: PointerTargetRequest
): Promise<UseCaseResponse<PointerTarget>> => {
  const { value: participant, error: participantError } =
    await participantRepository.getParticipantById(conversationId, userId);

  if (participantError || !participant) {
    return {
      data: null,
      error: "User is not a participant in the conversation.",
    };
  }

  const { value: message, error: messageError } =
    await messageRepository.getMessageById(messageId);

  if (messageError || !message || message.conversationId !== conversationId) {
    return {
      data: null,
      error: "Message does not exist in the conversation.",
    };
  }

  return { data: { participant, messageCreatedAt: message.createdAt } };
};

/**
 * Returns the user ids of a conversation's participants, used as the recipients of its events.
 */
export const getConversationRecipientUserIds = async (
  participantRepository: IParticipantRepository,
  conversationId: string
): Promise<UseCaseResponse<string[]>> => {
  const { value: participants, error } =
    await participantRepository.getParticipantsByConversationId(
      conversationId
    );

  if (error || !participants) {
    return {
      data: null,
      error: error?.message || "Error fetching conversation participants.",
    };
  }

  return { data: participants.map((participant) => participant.userId) };
};
