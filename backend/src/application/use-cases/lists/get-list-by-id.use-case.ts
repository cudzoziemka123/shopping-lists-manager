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
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GetListByIdUseCase {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
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

    // Обогащаем участников данными пользователя
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await this.userRepository.findById(member.userId);
        return {
          ...member,
          email: user?.email ?? null,
          username: user?.username ?? null,
        };
      }),
    );

    return { ...list, members: enrichedMembers };
  }
}
