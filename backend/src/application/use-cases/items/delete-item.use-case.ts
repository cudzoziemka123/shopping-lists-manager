import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IItemRepository } from '../../../domain/repositories/item.repository.interface';
import { ITEM_REPOSITORY } from '../../../domain/repositories/item.repository.interface';
import type { IListMemberRepository } from '../../../domain/repositories/list-member.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../domain/repositories/list-member.repository.interface';

@Injectable()
export class DeleteItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: IItemRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
  ) {}

  async execute(itemId: string, userId: string): Promise<void> {
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

    // 3. Удалить товар
    await this.itemRepository.delete(itemId);
  }
}
