import { injectable } from "inversify";

type Participant = { id: string; name: string };

type CurrentParticipantType = {
  id: string;
  customTitle: string | undefined;
};

export interface IConversationTitleService {
  buildConversationTitle(options: {
    currentParticipant: CurrentParticipantType;
    participantList: Participant[];
    customGroupTitle?: string;
  }): string;

  buildDefaultConversationTitle(options: {
    currentParticipant: CurrentParticipantType;
    participantList: Participant[];
  }): string;
}

@injectable()
export class ConversationTitleService implements IConversationTitleService {
  /**
   * Generates a default conversation title based on the names of the participants.
   *
   * If there is only one other participant, returns their name.
   * If there are multiple participants, returns up to 3 names separated by commas, followed by "..." if there are more than 3.
   * If there are no other participants, returns "You".
   *
   * @param options - The options for generating the conversation title.
   * @param options.currentParticipant - The ID of the current participant.
   * @param options.allParticipants - An array of all participants in the conversation.
   *
   * @returns A string representing the default title of the conversation.
   */

  public buildDefaultConversationTitle(options: {
    currentParticipant: CurrentParticipantType;
    participantList: Participant[];
  }): string {
    const { currentParticipant, participantList } = options;
    const otherNames = participantList
      .filter((p) => p.id !== currentParticipant.id)
      .map((p) => p.name);

    if (otherNames.length === 0) return "You";
    if (otherNames.length === 1) return otherNames[0];

    // Return up to 3 names for compact display
    const names = otherNames.slice(0, 3).join(", ");
    const suffix = otherNames.length > 3 ? "..." : "";

    return `${names}${suffix}`;
  }

  /**
   * Generates a custom conversation title based on the provided options.
   *
   * If a custom group title is provided, it returns that.
   * Otherwise, if the current participant has a custom title, it returns that.
   * If neither is provided, returns undefined.
   *
   * @param {Object} options - Options for generating the custom title.
   * @param {string} [options.customGroupTitle] - An optional custom title for the group conversation.
   * @param {string} [options.currentParticipantCustomTitle] - An optional custom title set by the current participant.
   *
   * @returns {string | undefined} The custom title of the conversation, or undefined if none is set.
   */

  private buildCustomConversationTitle(options: {
    customGroupTitle?: string;
    currentParticipant: CurrentParticipantType;
  }): string | undefined {
    // If the group conversation has a custom title, use that
    if (options.customGroupTitle) return options.customGroupTitle;

    if (options.currentParticipant.customTitle)
      return options.currentParticipant.customTitle;

    return undefined;
  }

  /**
   * Generates the title of the conversation.
   *
   * If a custom title is set for the conversation, or if the current participant has a custom title, it returns that.
   * Otherwise, it returns a default title generated based on the names of the participants.
   *
   * @returns {string} The title of the conversation.
   */
  public buildConversationTitle(options: {
    currentParticipant: CurrentParticipantType;
    participantList: Participant[];
    customGroupTitle?: string;
  }) {
    const { currentParticipant, participantList, customGroupTitle } = options;
    const customTitle = this.buildCustomConversationTitle({
      currentParticipant,
      customGroupTitle,
    });
    const defaultTitle = this.buildDefaultConversationTitle({
      currentParticipant,
      participantList,
    });

    return customTitle || defaultTitle;
  }
}
