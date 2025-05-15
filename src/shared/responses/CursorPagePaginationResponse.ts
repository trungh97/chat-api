import { ObjectType, Field, ClassType } from "type-graphql";

export function CursorBasedPaginationDTO<TItem extends ClassType>(
  TItemClass: TItem
) {
  @ObjectType()
  abstract class PaginationDTO {
    @Field(() => [TItemClass])
    items: InstanceType<TItem>[];

    @Field(() => String, { nullable: true })
    nextCursor?: string;
  }

  return PaginationDTO;
}
