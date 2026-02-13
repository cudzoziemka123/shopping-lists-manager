import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Item } from '../../../domain/entities/item.entity';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import { ITEM_REPOSITORY } from '../../../domain/repositories/item.repository.interface';
import type { IShoppingListRepository } from '../../../domain/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../domain/repositories/shopping-list.repository.interface';
import type { IListMemberRepository } from '../../../domain/repositories/list-member.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../domain/repositories/list-member.repository.interface';

@Injectable()
export class GetListItemsUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: IItemRepository,
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
  ) {}

  async execute(listId: string, userId: string): Promise<Item[]> {
    // 1. Check that list exists
    const list = await this.listRepository.findById(listId);
    if (!list) {
      throw new NotFoundException('List not found');
    }

    // 2. Check that user is a list member
    const member = await this.memberRepository.findByUserAndList(
      userId,
      listId,
    );
    if (!member) {
      throw new ForbiddenException('You are not a member of this list');
    }

    // 3. Get all items in the list
    return await this.itemRepository.findByListId(listId);
  }
}
