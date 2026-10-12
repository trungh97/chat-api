export interface UpdateUserPresenseRequest {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}
