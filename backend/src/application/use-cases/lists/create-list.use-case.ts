import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ShoppingList } from '../../../domain/entities/shopping-list.entity';
import {
  ListMember,
  MemberRole,
} from '../../../domain/entities/list-member.entity';
import type { IShoppingListRepository } from '../../../domain/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../domain/repositories/shopping-list.repository.interface';
import type { IListMemberRepository } from '../../../domain/repositories/list-member.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../domain/repositories/list-member.repository.interface';
import { CreateListDto } from '../../dto/lists/create-list.dto';

@Injectable()
export class CreateListUseCase {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
  ) {}

  async execute(dto: CreateListDto, userId: string): Promise<ShoppingList> {
    const now = new Date();

    // 1. Create new list
    const newList = new ShoppingList({
      id: randomUUID(),
      title: dto.title,
      description: dto.description || null,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    });

    const savedList = await this.listRepository.save(newList);

    // 2. Add creator as owner to list_members
    const ownerMember = new ListMember({
      id: randomUUID(),
      listId: savedList.id,
      userId: userId,
      role: MemberRole.OWNER,
      joinedAt: now,
    });

    await this.memberRepository.save(ownerMember);

    return savedList;
  }
}
