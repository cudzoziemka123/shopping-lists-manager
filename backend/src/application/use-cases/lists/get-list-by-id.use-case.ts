import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IShoppingListRepository } from '../../../domain/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../domain/repositories/shopping-list.repository.interface';
import type { IListMemberRepository } from '../../../domain/repositories/list-member.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../domain/repositories/list-member.repository.interface';

@Injectable()
export class GetListByIdUseCase {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
  ) {}

  async execute(listId: string, userId: string) {
    const list = await this.listRepository.findById(listId);

    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Проверяем что пользователь - участник списка
    const members = await this.memberRepository.findByListId(listId);
    const isMember = members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this list');
    }

    return { ...list, members };
  }
}
