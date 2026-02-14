import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteListUseCase } from '../../../../../src/application/use-cases/lists/delete-list.use-case';
import { SHOPPING_LIST_REPOSITORY } from '../../../../../src/domain/repositories/shopping-list.repository.interface';
import { ShoppingList } from '../../../../../src/domain/entities/shopping-list.entity';

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

describe('DeleteListUseCase', () => {
  let useCase: DeleteListUseCase;
  let listRepository: { findById: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    listRepository = {
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteListUseCase,
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
      ],
    }).compile();

    useCase = module.get(DeleteListUseCase);
  });

  it('should delete list when user is owner', async () => {
    const list = createMockList();
    listRepository.findById.mockResolvedValue(list);

    await useCase.execute('list-1', 'user-1');

    expect(listRepository.delete).toHaveBeenCalledWith('list-1');
  });

  it('should throw NotFoundException when list does not exist', async () => {
    listRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-list', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute('invalid-list', 'user-1')).rejects.toThrow(
      'List not found',
    );
    expect(listRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not owner', async () => {
    listRepository.findById.mockResolvedValue(createMockList());

    await expect(useCase.execute('list-1', 'other-user')).rejects.toThrow(
      ForbiddenException,
    );
    await expect(useCase.execute('list-1', 'other-user')).rejects.toThrow(
      'Only owner can delete the list',
    );
    expect(listRepository.delete).not.toHaveBeenCalled();
  });
});
