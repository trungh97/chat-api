export class Session {
  sessionId: string;
  data: string;

  constructor(sessionId: string, data: string) {
    this.sessionId = sessionId;
    this.data = data;
  }

  static create(sessionId: string, data: string): Session {
    return new Session(sessionId, data);
  }
}
