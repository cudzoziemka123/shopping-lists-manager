import { Test, TestingModule } from '@nestjs/testing';
import { GetUserListsUseCase } from '../../../../../src/application/use-cases/lists/get-user-lists.use-case';
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

describe('GetUserListsUseCase', () => {
  let useCase: GetUserListsUseCase;
  let listRepository: { findByUserId: jest.Mock };

  beforeEach(async () => {
    listRepository = { findByUserId: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserListsUseCase,
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
      ],
    }).compile();

    useCase = module.get(GetUserListsUseCase);
  });

  it('should return lists for user', async () => {
    const userId = 'user-1';
    const lists = [
      createMockList({ id: 'list-1', title: 'Zakupy' }),
      createMockList({ id: 'list-2', title: 'Praca' }),
    ];
    listRepository.findByUserId.mockResolvedValue(lists);

    const result = await useCase.execute(userId);

    expect(result).toEqual(lists);
    expect(listRepository.findByUserId).toHaveBeenCalledWith(userId);
  });

  it('should return empty array when user has no lists', async () => {
    listRepository.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
  });
});
