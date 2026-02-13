import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IShoppingListRepository } from '../../../domain/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../domain/repositories/shopping-list.repository.interface';

@Injectable()
export class DeleteListUseCase {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
  ) {}

  async execute(listId: string, userId: string): Promise<void> {
    // 1. Find the list
    const list = await this.listRepository.findById(listId);

    if (!list) {
      throw new NotFoundException('List not found');
    }

    // 2. Check that user is the owner
    if (list.ownerId !== userId) {
      throw new ForbiddenException('Only owner can delete the list');
    }

    // 3. Delete the list
    await this.listRepository.delete(listId);
  }
}
