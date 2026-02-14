import { Test, TestingModule } from '@nestjs/testing';
import { CreateListUseCase } from '../../../../../src/application/use-cases/lists/create-list.use-case';
import { SHOPPING_LIST_REPOSITORY } from '../../../../../src/domain/repositories/shopping-list.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../../../../../src/domain/repositories/list-member.repository.interface';
import { ShoppingList } from '../../../../../src/domain/entities/shopping-list.entity';
import { ListMember, MemberRole } from '../../../../../src/domain/entities/list-member.entity';

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

describe('CreateListUseCase', () => {
  let useCase: CreateListUseCase;
  let listRepository: { save: jest.Mock };
  let memberRepository: { save: jest.Mock };

  beforeEach(async () => {
    listRepository = {
      save: jest.fn().mockImplementation((list: ShoppingList) => Promise.resolve(list)),
    };
    memberRepository = {
      save: jest.fn().mockImplementation((member: ListMember) => Promise.resolve(member)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateListUseCase,
        { provide: SHOPPING_LIST_REPOSITORY, useValue: listRepository },
        { provide: LIST_MEMBER_REPOSITORY, useValue: memberRepository },
      ],
    }).compile();

    useCase = module.get(CreateListUseCase);
  });

  it('should create list and add owner as member', async () => {
    const dto = { title: 'Zakupy', description: 'Tygodniowe' };
    const userId = 'user-1';

    const result = await useCase.execute(dto, userId);

    expect(result).toBeDefined();
    expect(result.title).toBe(dto.title);
    expect(result.description).toBe(dto.description);
    expect(result.ownerId).toBe(userId);
    expect(listRepository.save).toHaveBeenCalledTimes(1);
    const savedList = listRepository.save.mock.calls[0][0];
    expect(savedList.title).toBe(dto.title);
    expect(savedList.ownerId).toBe(userId);

    expect(memberRepository.save).toHaveBeenCalledTimes(1);
    const savedMember = memberRepository.save.mock.calls[0][0];
    expect(savedMember.userId).toBe(userId);
    expect(savedMember.role).toBe(MemberRole.OWNER);
    expect(savedMember.listId).toBe(result.id);
  });

  it('should set description to null when not provided', async () => {
    const dto = { title: 'Lista' };
    listRepository.save.mockImplementation((list: ShoppingList) => Promise.resolve(list));

    const result = await useCase.execute(dto, 'user-1');

    expect(result.description).toBeNull();
    const savedList = listRepository.save.mock.calls[0][0];
    expect(savedList.description).toBeNull();
  });
});
