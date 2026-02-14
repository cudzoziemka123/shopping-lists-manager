import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateItemUseCase } from '../../../../../src/application/use-cases/items/create-item.use-case';
import { ITEM_REPOSITORY } from '../../../../../src/domain/repositories/item.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../../../src/domain/repositories/shopping-list.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../../../src/domain/repositories/list-member.repository.interface';
import { ListsGateway } from '../../../../../src/infrastructure/websocket/lists.gateway';
import { ItemStatus, ItemPriority } from '../../../../../src/domain/entities/item.entity';
import { ShoppingList } from '../../../../../src/domain/entities/shopping-list.entity';
import { ListMember, MemberRole } from '../../../../../src/domain/entities/list-member.entity';

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

describe('CreateItemUseCase', () => {
  let useCase: CreateItemUseCase;
  let itemRepository: { save: jest.Mock };
  let listRepository: { findById: jest.Mock };
  let memberRepository: { findByUserAndList: jest.Mock };
  let listsGateway: { emitItemCreated: jest.Mock };

  beforeEach(async () => {
    itemRepository = { save: jest.fn() };
    listRepository = { findById: jest.fn() };
    memberRepository = { findByUserAndList: jest.fn() };
    listsGateway = { emitItemCreated: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateItemUseCase,
        { provide: ITEM_REPOSITORY, useValue: itemRepository },
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
        { provide: ListsGateway, useValue: listsGateway },
      ],
    }).compile();

    useCase = module.get(CreateItemUseCase);
  });

  it('should create item and emit WebSocket event', async () => {
    const listId = 'list-1';
    const userId = 'user-1';
    const dto = { name: 'Mleko', quantity: 2, unit: 'l' as const };

    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.save.mockImplementation((item: any) =>
      Promise.resolve({ ...item, id: item.id }),
    );

    const result = await useCase.execute(listId, dto, userId);

    expect(result).toBeDefined();
    expect(result.listId).toBe(listId);
    expect(result.name).toBe('Mleko');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('l');
    expect(result.status).toBe(ItemStatus.PENDING);
    expect(result.priority).toBe(ItemPriority.MEDIUM);
    expect(result.addedById).toBe(userId);
    expect(itemRepository.save).toHaveBeenCalledTimes(1);
    const savedItem = itemRepository.save.mock.calls[0][0];
    expect(savedItem.name).toBe('Mleko');
    expect(listsGateway.emitItemCreated).toHaveBeenCalledWith(listId, result);
  });

  it('should use default priority MEDIUM when not provided', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.save.mockImplementation((item: any) => Promise.resolve(item));

    await useCase.execute('list-1', { name: 'Chleb', quantity: 1 }, 'user-1');

    const savedItem = itemRepository.save.mock.calls[0][0];
    expect(savedItem.priority).toBe(ItemPriority.MEDIUM);
  });

  it('should throw NotFoundException when list does not exist', async () => {
    listRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid-list', { name: 'Mleko', quantity: 1 }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      useCase.execute('invalid-list', { name: 'Mleko', quantity: 1 }, 'user-1'),
    ).rejects.toThrow('List not found');
    expect(itemRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    listRepository.findById.mockResolvedValue(createMockList());
    memberRepository.findByUserAndList.mockResolvedValue(null);

    await expect(
      useCase.execute('list-1', { name: 'Mleko', quantity: 1 }, 'stranger'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute('list-1', { name: 'Mleko', quantity: 1 }, 'stranger'),
    ).rejects.toThrow('You are not a member of this list');
    expect(itemRepository.save).not.toHaveBeenCalled();
  });
});
