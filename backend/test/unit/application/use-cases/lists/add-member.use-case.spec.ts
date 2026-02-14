import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AddMemberUseCase } from '../../../../../src/application/use-cases/lists/add-member.use-case';
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
    ownerId: 'owner-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const createMockUser = (overrides: Partial<User> = {}): User =>
  new User({
    id: 'user-2',
    username: 'anna',
    email: 'anna@example.com',
    passwordHash: 'hash',
    createdAt: new Date(),
    ...overrides,
  });

const createMockMember = (overrides: Partial<ListMember> = {}): ListMember =>
  new ListMember({
    id: 'member-1',
    listId: 'list-1',
    userId: 'user-2',
    role: MemberRole.MEMBER,
    joinedAt: new Date(),
    ...overrides,
  });

describe('AddMemberUseCase', () => {
  let useCase: AddMemberUseCase;
  let listRepository: { findById: jest.Mock };
  let memberRepository: { findByUserAndList: jest.Mock; save: jest.Mock };
  let userRepository: { findByUsername: jest.Mock; findByEmail: jest.Mock };

  beforeEach(async () => {
    listRepository = { findById: jest.fn() };
    memberRepository = {
      findByUserAndList: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((m: ListMember) => Promise.resolve(m)),
    };
    userRepository = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddMemberUseCase,
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(AddMemberUseCase);
  });

  it('should add member by username', async () => {
    const userToAdd = createMockUser();
    listRepository.findById.mockResolvedValue(createMockList());
    userRepository.findByUsername.mockResolvedValue(userToAdd);
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute(
      'list-1',
      { usernameOrEmail: 'anna' },
      'owner-1',
    );

    expect(result).toBeDefined();
    expect(result.userId).toBe(userToAdd.id);
    expect(result.role).toBe(MemberRole.MEMBER);
    expect(result.listId).toBe('list-1');
    expect(userRepository.findByUsername).toHaveBeenCalledWith('anna');
    expect(memberRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should find user by email when username not found', async () => {
    const userToAdd = createMockUser();
    listRepository.findById.mockResolvedValue(createMockList());
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(userToAdd);

    await useCase.execute(
      'list-1',
      { usernameOrEmail: 'anna@example.com' },
      'owner-1',
    );

    expect(userRepository.findByEmail).toHaveBeenCalledWith('anna@example.com');
    expect(memberRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when list does not exist', async () => {
    listRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-list', { usernameOrEmail: 'anna' }, 'owner-1'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      useCase.execute('invalid-list', { usernameOrEmail: 'anna' }, 'owner-1'),
    ).rejects.toThrow('List not found');
    expect(memberRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when current user is not owner', async () => {
    listRepository.findById.mockResolvedValue(createMockList());

    await expect(
      useCase.execute('list-1', { usernameOrEmail: 'anna' }, 'other-user'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute('list-1', { usernameOrEmail: 'anna' }, 'other-user'),
    ).rejects.toThrow('Only owner can add members');
    expect(memberRepository.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when user not found', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('list-1', { usernameOrEmail: 'unknown' }, 'owner-1'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      useCase.execute('list-1', { usernameOrEmail: 'unknown' }, 'owner-1'),
    ).rejects.toThrow('User not found');
    expect(memberRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when user is already a member', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    userRepository.findByUsername.mockResolvedValue(createMockUser());
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());

    await expect(
      useCase.execute('list-1', { usernameOrEmail: 'anna' }, 'owner-1'),
    ).rejects.toThrow(ConflictException);
    await expect(
      useCase.execute('list-1', { usernameOrEmail: 'anna' }, 'owner-1'),
    ).rejects.toThrow('User is already a member of this list');
    expect(memberRepository.save).not.toHaveBeenCalled();
  });
});
