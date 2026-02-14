import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RemoveMemberUseCase } from '../../../../../src/application/use-cases/lists/remove-member.use-case';
import { SHOPPING_LIST_REPOSITORY } from '../../../../../src/domain/repositories/shopping-list.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../../../src/domain/repositories/list-member.repository.interface';
import { ShoppingList } from '../../../../../src/domain/entities/shopping-list.entity';
import { ListMember, MemberRole } from '../../../../../src/domain/entities/list-member.entity';

const createMockList = (overrides: Partial<ShoppingList> = {}): ShoppingList =>
  new ShoppingList({
    id: 'list-1',
    title: 'Zakupy',
    description: null,
    ownerId: 'owner-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const createMockMember = (overrides: Partial<ListMember> = {}): ListMember =>
  new ListMember({
    id: 'member-1',
    listId: 'list-1',
    userId: 'user-1',
    role: MemberRole.MEMBER,
    joinedAt: new Date(),
    ...overrides,
  });

describe('RemoveMemberUseCase', () => {
  let useCase: RemoveMemberUseCase;
  let listRepository: { findById: jest.Mock };
  let memberRepository: { findByListId: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    listRepository = { findById: jest.fn() };
    memberRepository = {
      findByListId: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveMemberUseCase,
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
      ],
    }).compile();

    useCase = module.get(RemoveMemberUseCase);
  });

  it('should remove member when current user is owner', async () => {
    const list = createMockList();
    const members = [
      createMockMember({ id: 'owner-member', role: MemberRole.OWNER, userId: 'owner-1' }),
      createMockMember({ id: 'member-2', userId: 'user-2' }),
    ];
    listRepository.findById.mockResolvedValue(list);
    memberRepository.findByListId.mockResolvedValue(members);

    await useCase.execute('list-1', 'member-2', 'owner-1');

    expect(memberRepository.delete).toHaveBeenCalledWith('member-2');
  });

  it('should throw NotFoundException when list does not exist', async () => {
    listRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-list', 'member-1', 'owner-1'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      useCase.execute('invalid-list', 'member-1', 'owner-1'),
    ).rejects.toThrow('List not found');
    expect(memberRepository.findByListId).not.toHaveBeenCalled();
    expect(memberRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when current user is not owner', async () => {
    listRepository.findById.mockResolvedValue(createMockList());

    await expect(
      useCase.execute('list-1', 'member-1', 'other-user'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute('list-1', 'member-1', 'other-user'),
    ).rejects.toThrow('Only owner can remove members');
    expect(memberRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when member not found', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByListId.mockResolvedValue([
      createMockMember({ id: 'member-1' }),
    ]);

    await expect(
      useCase.execute('list-1', 'non-existent-member-id', 'owner-1'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      useCase.execute('list-1', 'non-existent-member-id', 'owner-1'),
    ).rejects.toThrow('Member not found');
    expect(memberRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when trying to remove owner', async () => {
    const list = createMockList();
    const members = [
      createMockMember({ id: 'owner-member', role: MemberRole.OWNER, userId: 'owner-1' }),
    ];
    listRepository.findById.mockResolvedValue(list);
    memberRepository.findByListId.mockResolvedValue(members);

    await expect(
      useCase.execute('list-1', 'owner-member', 'owner-1'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute('list-1', 'owner-member', 'owner-1'),
    ).rejects.toThrow('Cannot remove the owner');
    expect(memberRepository.delete).not.toHaveBeenCalled();
  });
});
