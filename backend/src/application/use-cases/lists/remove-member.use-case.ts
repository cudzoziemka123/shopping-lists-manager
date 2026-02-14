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
import { MemberRole } from '../../../domain/entities/list-member.entity';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
  ) {}

  async execute(
    listId: string,
    memberId: string,
    currentUserId: string,
  ): Promise<void> {
    const list = await this.listRepository.findById(listId);
    if (!list) {
      throw new NotFoundException('List not found');
    }

    if (list.ownerId !== currentUserId) {
      throw new ForbiddenException('Only owner can remove members');
    }

    const members = await this.memberRepository.findByListId(listId);
    const memberToRemove = members.find((m) => m.id === memberId);

    if (!memberToRemove) {
      throw new NotFoundException('Member not found');
    }

    if (memberToRemove.role === MemberRole.OWNER) {
      throw new ForbiddenException('Cannot remove the owner');
    }

    await this.memberRepository.delete(memberId);
  }
}
