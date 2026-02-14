import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateItemUseCase } from '../../../../../src/application/use-cases/items/update-item.use-case';
import { ITEM_REPOSITORY } from '../../../../../src/domain/repositories/item.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../../../src/domain/repositories/list-member.repository.interface';
import { ListsGateway } from '../../../../../src/infrastructure/websocket/lists.gateway';
import { Item, ItemStatus, ItemPriority } from '../../../../../src/domain/entities/item.entity';
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

const createMockMember = (): ListMember =>
  new ListMember({
    id: 'member-1',
    listId: 'list-1',
    userId: 'user-1',
    role: MemberRole.OWNER,
    joinedAt: new Date(),
  });

describe('UpdateItemUseCase', () => {
  let useCase: UpdateItemUseCase;
  let itemRepository: { findById: jest.Mock; update: jest.Mock };
  let memberRepository: { findByUserAndList: jest.Mock };
  let listsGateway: { emitItemUpdated: jest.Mock };

  beforeEach(async () => {
    itemRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    memberRepository = { findByUserAndList: jest.fn() };
    listsGateway = { emitItemUpdated: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateItemUseCase,
        { provide: ITEM_REPOSITORY, useValue: itemRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
        { provide: ListsGateway, useValue: listsGateway },
      ],
    }).compile();

    useCase = module.get(UpdateItemUseCase);
  });

  it('should throw NotFoundException when item does not exist', async () => {
    itemRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('item-1', { name: 'New name' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      useCase.execute('item-1', { name: 'New name' }, 'user-1'),
    ).rejects.toThrow('Item not found');
    expect(itemRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    itemRepository.findById.mockResolvedValue(createMockItem());
    memberRepository.findByUserAndList.mockResolvedValue(null);

    await expect(
      useCase.execute('item-1', { name: 'New name' }, 'stranger'),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      useCase.execute('item-1', { name: 'New name' }, 'stranger'),
    ).rejects.toThrow('You are not a member of this list');
    expect(itemRepository.update).not.toHaveBeenCalled();
  });

  it('should update item name and return saved item', async () => {
    const existingItem = createMockItem();
    const savedItem = createMockItem({ name: 'Mleko 2%', updatedAt: new Date() });
    itemRepository.findById.mockResolvedValue(existingItem);
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.update.mockImplementation((item: Item) =>
      Promise.resolve({ ...item, name: 'Mleko 2%' }),
    );

    const result = await useCase.execute('item-1', { name: 'Mleko 2%' }, 'user-1');

    expect(result.name).toBe('Mleko 2%');
    expect(itemRepository.update).toHaveBeenCalled();
    const updatedItem = itemRepository.update.mock.calls[0][0];
    expect(updatedItem.name).toBe('Mleko 2%');
    expect(listsGateway.emitItemUpdated).toHaveBeenCalledWith('list-1', result);
  });

  it('should set purchasedById and purchasedAt when status changes to purchased', async () => {
    const existingItem = createMockItem({ status: ItemStatus.PENDING });
    const userId = 'user-1';
    itemRepository.findById.mockResolvedValue(existingItem);
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.update.mockImplementation((item: Item) => Promise.resolve(item));

    await useCase.execute('item-1', { status: ItemStatus.PURCHASED }, userId);

    const updatedItem = itemRepository.update.mock.calls[0][0];
    expect(updatedItem.status).toBe(ItemStatus.PURCHASED);
    expect(updatedItem.purchasedById).toBe(userId);
    expect(updatedItem.purchasedAt).toBeInstanceOf(Date);
  });

  it('should keep purchasedById when updating other fields and status stays purchased', async () => {
    const existingItem = createMockItem({
      status: ItemStatus.PURCHASED,
      purchasedById: 'user-1',
      purchasedAt: new Date('2025-01-01'),
    });
    itemRepository.findById.mockResolvedValue(existingItem);
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.update.mockImplementation((item: Item) => Promise.resolve(item));

    await useCase.execute('item-1', { name: 'Mleko 3.2%' }, 'user-1');

    const updatedItem = itemRepository.update.mock.calls[0][0];
    expect(updatedItem.name).toBe('Mleko 3.2%');
    expect(updatedItem.purchasedById).toBe('user-1');
    expect(updatedItem.purchasedAt).toBeInstanceOf(Date);
  });

  it('should keep purchasedById when status changes back to pending', async () => {
    const existingItem = createMockItem({
      status: ItemStatus.PURCHASED,
      purchasedById: 'user-1',
      purchasedAt: new Date(),
    });
    itemRepository.findById.mockResolvedValue(existingItem);
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());
    itemRepository.update.mockImplementation((item: Item) => Promise.resolve(item));

    await useCase.execute('item-1', { status: ItemStatus.PENDING }, 'user-1');

    const updatedItem = itemRepository.update.mock.calls[0][0];
    expect(updatedItem.status).toBe(ItemStatus.PENDING);
    expect(updatedItem.purchasedById).toBe('user-1');
    expect(updatedItem.purchasedAt).toBeDefined();
  });
});
