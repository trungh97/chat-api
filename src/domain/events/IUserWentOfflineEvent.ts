export type IUserWentOfflineEventPayload = {
  userId: string;
  lastSeenAt: Date;
};

export interface IUserWhenOfflineEvent {
  handler(event: IUserWentOfflineEventPayload): Promise<void>;
}
