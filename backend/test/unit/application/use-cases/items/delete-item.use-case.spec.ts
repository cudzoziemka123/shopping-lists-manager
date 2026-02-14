import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteItemUseCase } from '../../../../../src/application/use-cases/items/delete-item.use-case';
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

describe('DeleteItemUseCase', () => {
  let useCase: DeleteItemUseCase;
  let itemRepository: { findById: jest.Mock; delete: jest.Mock };
  let memberRepository: { findByUserAndList: jest.Mock };
  let listsGateway: { emitItemDeleted: jest.Mock };

  beforeEach(async () => {
    itemRepository = {
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    memberRepository = { findByUserAndList: jest.fn() };
    listsGateway = { emitItemDeleted: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteItemUseCase,
        { provide: ITEM_REPOSITORY, useValue: itemRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
        { provide: ListsGateway, useValue: listsGateway },
      ],
    }).compile();

    useCase = module.get(DeleteItemUseCase);
  });

  it('should delete item and emit WebSocket event', async () => {
    const item = createMockItem();
    itemRepository.findById.mockResolvedValue(item);
    memberRepository.findByUserAndList.mockResolvedValue(createMockMember());

    await useCase.execute('item-1', 'user-1');

    expect(itemRepository.delete).toHaveBeenCalledWith('item-1');
    expect(listsGateway.emitItemDeleted).toHaveBeenCalledWith('list-1', 'item-1');
  });

  it('should throw NotFoundException when item does not exist', async () => {
    itemRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('item-1', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute('item-1', 'user-1')).rejects.toThrow(
      'Item not found',
    );
    expect(itemRepository.delete).not.toHaveBeenCalled();
    expect(listsGateway.emitItemDeleted).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    itemRepository.findById.mockResolvedValue(createMockItem());
    memberRepository.findByUserAndList.mockResolvedValue(null);

    await expect(useCase.execute('item-1', 'stranger')).rejects.toThrow(
      ForbiddenException,
    );
    await expect(useCase.execute('item-1', 'stranger')).rejects.toThrow(
      'You are not a member of this list',
    );
    expect(itemRepository.delete).not.toHaveBeenCalled();
    expect(listsGateway.emitItemDeleted).not.toHaveBeenCalled();
  });
});
