import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetListByIdUseCase } from '../../../../../src/application/use-cases/lists/get-list-by-id.use-case';
import { SHOPPING_LIST_REPOSITORY } from '../../../../../src/domain/repositories/shopping-list.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../../../src/domain/repositories/list-member.repository.interface';
import { USER_REPOSITORY } from '../../../../../src/domain/repositories/user.repository.interface';
import { ShoppingList } from '../../../../../src/domain/entities/shopping-list.entity';
import { ListMember, MemberRole } from '../../../../../src/domain/entities/list-member.entity';
import { User } from '../../../../../src/domain/entities/user.entity';

const createMockList = (overrides: Partial<ShoppingList> = {}): ShoppingList =>
  new ShoppingList({
    id: 'list-1',
    title: 'Zakupy',
    description: null,
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const createMockMember = (overrides: Partial<ListMember> = {}): ListMember =>
  new ListMember({
    id: 'member-1',
    listId: 'list-1',
    userId: 'user-1',
    role: MemberRole.OWNER,
    joinedAt: new Date(),
    ...overrides,
  });

const createMockUser = (overrides: Partial<User> = {}): User =>
  new User({
    id: 'user-1',
    username: 'jan',
    email: 'jan@example.com',
    passwordHash: 'hash',
    createdAt: new Date(),
    ...overrides,
  });

describe('GetListByIdUseCase', () => {
  let useCase: GetListByIdUseCase;
  let listRepository: { findById: jest.Mock };
  let memberRepository: { findByListId: jest.Mock };
  let userRepository: { findById: jest.Mock };

  beforeEach(async () => {
    listRepository = { findById: jest.fn() };
    memberRepository = { findByListId: jest.fn() };
    userRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetListByIdUseCase,
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(GetListByIdUseCase);
  });

  it('should return list with enriched members', async () => {
    const list = createMockList();
    const members = [
      createMockMember({ userId: 'user-1' }),
      createMockMember({ id: 'member-2', userId: 'user-2', role: MemberRole.MEMBER }),
    ];
    const user1 = createMockUser({ id: 'user-1', username: 'jan', email: 'jan@example.com' });
    const user2 = new User({
      id: 'user-2',
      username: 'anna',
      email: 'anna@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
    });

    listRepository.findById.mockResolvedValue(list);
    memberRepository.findByListId.mockResolvedValue(members);
    userRepository.findById
      .mockResolvedValueOnce(user1)
      .mockResolvedValueOnce(user2);

    const result = await useCase.execute('list-1', 'user-1');

    expect(result.title).toBe(list.title);
    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toMatchObject({
      userId: 'user-1',
      email: 'jan@example.com',
      username: 'jan',
    });
    expect(result.members[1]).toMatchObject({
      userId: 'user-2',
      email: 'anna@example.com',
      username: 'anna',
    });
    expect(listRepository.findById).toHaveBeenCalledWith('list-1');
    expect(memberRepository.findByListId).toHaveBeenCalledWith('list-1');
  });

  it('should throw NotFoundException when list does not exist', async () => {
    listRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-list', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute('invalid-list', 'user-1')).rejects.toThrow(
      'List not found',
    );
    expect(memberRepository.findByListId).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    const list = createMockList();
    const members = [createMockMember({ userId: 'user-1' })];
    listRepository.findById.mockResolvedValue(list);
    memberRepository.findByListId.mockResolvedValue(members);

    await expect(useCase.execute('list-1', 'stranger-user')).rejects.toThrow(
      ForbiddenException,
    );
    await expect(useCase.execute('list-1', 'stranger-user')).rejects.toThrow(
      'You are not a member of this list',
    );
  });

  it('should set email and username to null when user not found', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByListId.mockResolvedValue([
      createMockMember({ id: 'm1', userId: 'user-1' }),
      createMockMember({ id: 'm2', userId: 'deleted-user', role: MemberRole.MEMBER }),
    ]);
    userRepository.findById
      .mockResolvedValueOnce(createMockUser({ id: 'user-1' }))
      .mockResolvedValueOnce(null);

    const result = await useCase.execute('list-1', 'user-1');

    const memberWithDeletedUser = result.members.find((m) => m.userId === 'deleted-user');
    expect(memberWithDeletedUser?.email).toBeNull();
    expect(memberWithDeletedUser?.username).toBeNull();
  });
});
