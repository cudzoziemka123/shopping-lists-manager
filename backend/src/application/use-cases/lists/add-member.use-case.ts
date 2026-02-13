import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ListMember,
  MemberRole,
} from '../../../domain/entities/list-member.entity';
import type { IShoppingListRepository } from '../../../domain/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../domain/repositories/shopping-list.repository.interface';
import type { IListMemberRepository } from '../../../domain/repositories/list-member.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../domain/repositories/list-member.repository.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { AddMemberDto } from '../../dto/lists/add-member.dto';

@Injectable()
export class AddMemberUseCase {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
    @Inject(LIST_MEMBER_REPOSITORY)
    private readonly memberRepository: IListMemberRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    listId: string,
    dto: AddMemberDto,
    currentUserId: string,
  ): Promise<ListMember> {
    // 1. Check that list exists
    const list = await this.listRepository.findById(listId);
    if (!list) {
      throw new NotFoundException('List not found');
    }

    // 2. Check that current user is the owner
    if (list.ownerId !== currentUserId) {
      throw new ForbiddenException('Only owner can add members');
    }

    // 3. Find user by username or email
    let userToAdd = await this.userRepository.findByUsername(
      dto.usernameOrEmail,
    );
    if (!userToAdd) {
      userToAdd = await this.userRepository.findByEmail(dto.usernameOrEmail);
    }
    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // 4. Check that user is not already a member
    const existingMember = await this.memberRepository.findByUserAndList(
      userToAdd.id,
      listId,
    );
    if (existingMember) {
      throw new ConflictException('User is already a member of this list');
    }

    // 5. Add the member
    const newMember = new ListMember({
      id: randomUUID(),
      listId: listId,
      userId: userToAdd.id,
      role: MemberRole.MEMBER,
      joinedAt: new Date(),
    });

    return await this.memberRepository.save(newMember);
  }
}
