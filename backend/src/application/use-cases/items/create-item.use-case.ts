import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Item,
  ItemStatus,
  ItemPriority,
} from '../../../domain/entities/item.entity';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import { ITEM_REPOSITORY } from '../../../domain/repositories/item.repository.interface';
import type { IShoppingListRepository } from '../../../domain/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../domain/repositories/shopping-list.repository.interface';
import type { IListMemberRepository } from '../../../domain/repositories/list-member.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../domain/repositories/list-member.repository.interface';
import { CreateItemDto } from '../../dto/items/create-item.dto';

@Injectable()
export class CreateItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: IItemRepository,
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
  ) {}

  async execute(
    listId: string,
    dto: CreateItemDto,
    userId: string,
  ): Promise<Item> {
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

    // 3. Create item
    const now = new Date();
    const newItem = new Item({
      id: randomUUID(),
      listId,
      name: dto.name,
      quantity: dto.quantity,
      unit: dto.unit || null,
      status: ItemStatus.PENDING,
      priority: dto.priority || ItemPriority.MEDIUM,
      addedById: userId,
      createdAt: now,
      updatedAt: now,
    });

    return await this.itemRepository.save(newItem);
  }
}
