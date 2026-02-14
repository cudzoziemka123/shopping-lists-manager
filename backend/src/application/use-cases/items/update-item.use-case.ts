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
import { ListsGateway } from '../../../infrastructure/websocket/lists.gateway';

@Injectable()
export class UpdateItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: IItemRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
    private readonly listsGateway: ListsGateway,
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

    // 3. Update item fields
    const newStatus = dto.status ?? item.status;
    const updatedItem = new Item({
      ...item,
      name: dto.name ?? item.name,
      quantity: dto.quantity ?? item.quantity,
      unit: dto.unit !== undefined ? dto.unit : item.unit,
      status: newStatus,
      priority: dto.priority ?? item.priority,
      purchasedById:
        newStatus.toString() === 'purchased' ? userId : item.purchasedById,
      purchasedAt:
        newStatus.toString() === 'purchased' ? new Date() : item.purchasedAt,
      updatedAt: new Date(),
    });
    const savedItem = await this.itemRepository.update(updatedItem);

    this.listsGateway.emitItemUpdated(item.listId, savedItem);
    return savedItem;
  }
}
