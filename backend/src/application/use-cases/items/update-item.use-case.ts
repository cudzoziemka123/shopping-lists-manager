import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Item } from '../../../domain/entities/item.entity';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import { ITEM_REPOSITORY } from '../../../domain/repositories/item.repository.interface';
import type { IListMemberRepository } from '../../../domain/repositories/list-member.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../domain/repositories/list-member.repository.interface';
import { UpdateItemDto } from '../../dto/items/update-item.dto';

@Injectable()
export class UpdateItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: IItemRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
  ) {}

  async execute(
    itemId: string,
    dto: UpdateItemDto,
    userId: string,
  ): Promise<Item> {
    // 1. Найти товар
    const item = await this.itemRepository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // 2. Проверить что пользователь - участник списка
    const member = await this.memberRepository.findByUserAndList(
      userId,
      item.listId,
    );
    if (!member) {
      throw new ForbiddenException('You are not a member of this list');
    }

    // 3. Обновить поля
    const updatedItem = new Item({
      ...item,
      name: dto.name ?? item.name,
      quantity: dto.quantity ?? item.quantity,
      unit: dto.unit !== undefined ? dto.unit : item.unit,
      status: dto.status ?? item.status,
      priority: dto.priority ?? item.priority,
      updatedAt: new Date(),
    });

    return await this.itemRepository.update(updatedItem);
  }
}
