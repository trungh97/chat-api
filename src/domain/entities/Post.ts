export class Post {
  private _id: string;
  private _title: string;
  private _content: string;

  /**
   * Create a new instance of PostEntity
   *
   * @constructor
   * @param props - The properties of the post
   */
  constructor(id: string, title: string, content: string) {
    this._id = id;
    this._title = title;
    this._content = content;
  }

  /**
   * Get the post id
   *
   * @readonly
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get the post title
   *
   * @readonly
   */
  get title(): string {
    return this._title;
  }

  /**
   * Get the post content
   *
   * @readonly
   */
  get content(): string {
    return this._content;
  }
}
