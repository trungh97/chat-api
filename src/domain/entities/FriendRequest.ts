import { ICreateFriendRequestDTO } from "@domain/dtos/friendRequest";
import { FriendRequestStatus } from "@domain/enums";
import { v4 as uuid } from "uuid";

export interface FriendRequestProps {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
}

export class FriendRequest {
  private readonly _id: string;
  private _senderId: string;
  private _receiverId: string;
  private _status: FriendRequestStatus;

  constructor({ id, senderId, receiverId, status }: FriendRequestProps) {
    this._id = id;
    this._senderId = senderId;
    this._receiverId = receiverId;
    this._status = status;
  }

  get id(): string {
    return this._id;
  }

  get senderId(): string {
    return this._senderId;
  }

  set senderId(senderId: string) {
    this._senderId = senderId;
  }

  get receiverId(): string {
    return this._receiverId;
  }

  set receiverId(receiverId: string) {
    this._receiverId = receiverId;
  }

  get status(): FriendRequestStatus {
    return this._status;
  }

  set status(status: FriendRequestStatus) {
    this._status = status;
  }

  static async create(
    request: ICreateFriendRequestDTO
  ): Promise<FriendRequest> {
    if (request.senderId === request.receiverId) {
      throw new Error("Sender and receiver cannot be the same.");
    }

    const newFriendRequest = {
      id: uuid(),
      senderId: request.senderId,
      receiverId: request.receiverId,
      status: FriendRequestStatus.PENDING,
    };

    return new FriendRequest(newFriendRequest);
  }
}
