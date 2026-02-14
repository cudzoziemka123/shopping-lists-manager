import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetListItemsUseCase } from '../../../../../src/application/use-cases/items/get-list-items.use-case';
import { ITEM_REPOSITORY } from '../../../../../src/domain/repositories/item.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../../../src/domain/repositories/shopping-list.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../../../src/domain/repositories/list-member.repository.interface';
import { Item, ItemStatus, ItemPriority } from '../../../../../src/domain/entities/item.entity';
import { ShoppingList } from '../../../../../src/domain/entities/shopping-list.entity';
import { ListMember, MemberRole } from '../../../../../src/domain/entities/list-member.entity';

const createMockItem = (overrides: Partial<Item> = {}): Item =>
  new Item({
    id: 'item-1',
    listId: 'list-1',
    name: 'Mleko',
    quantity: 2,
    unit: 'l',
    status: ItemStatus.PENDING,
    priority: ItemPriority.MEDIUM,
    addedById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const createMockList = (): ShoppingList =>
  new ShoppingList({
    id: 'list-1',
    title: 'Zakupy',
    description: null,
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const createMockMember = (): ListMember =>
  new ListMember({
    id: 'member-1',
    listId: 'list-1',
    userId: 'user-1',
    role: MemberRole.OWNER,
    joinedAt: new Date(),
  });

describe('GetListItemsUseCase', () => {
  let useCase: GetListItemsUseCase;
  let itemRepository: { findByListId: jest.Mock; findById: jest.Mock };
  let listRepository: { findById: jest.Mock };
  let memberRepository: { findByUserAndList: jest.Mock };

  beforeEach(async () => {
    itemRepository = {
      findByListId: jest.fn(),
      findById: jest.fn(),
    };
    listRepository = { findById: jest.fn() };
    memberRepository = { findByUserAndList: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetListItemsUseCase,
        { provide: ITEM_REPOSITORY, useValue: itemRepository },
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
      ],
    }).compile();

    useCase = module.get(GetListItemsUseCase);
  });

  it('should return items when list exists and user is member', async () => {
    const listId = 'list-1';
    const userId = 'user-1';
    const items = [createMockItem(), createMockItem({ id: 'item-2', name: 'Chleb' })];

    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.findByListId.mockResolvedValue(items);

    const result = await useCase.execute(listId, userId);

    expect(result).toEqual(items);
    expect(listRepository.findById).toHaveBeenCalledWith(listId);
    expect(memberRepository.findByUserAndList).toHaveBeenCalledWith(userId, listId);
    expect(itemRepository.findByListId).toHaveBeenCalledWith(listId);
  });

  it('should throw NotFoundException when list does not exist', async () => {
    listRepository.findById.mockResolvedValue(null);
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());

    await expect(useCase.execute('invalid-list', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute('invalid-list', 'user-1')).rejects.toThrow(
      'List not found',
    );
    expect(itemRepository.findByListId).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByUserAndList.mockResolvedValue(null);

    await expect(useCase.execute('list-1', 'stranger-user')).rejects.toThrow(
      ForbiddenException,
    );
    await expect(useCase.execute('list-1', 'stranger-user')).rejects.toThrow(
      'You are not a member of this list',
    );
    expect(itemRepository.findByListId).not.toHaveBeenCalled();
  });

  it('should return empty array when list has no items', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.findByListId.mockResolvedValue([]);

    const result = await useCase.execute('list-1', 'user-1');

    expect(result).toEqual([]);
    expect(itemRepository.findByListId).toHaveBeenCalledWith('list-1');
  });
});
