import { Injectable, Inject } from '@nestjs/common';
import { ShoppingList } from '../../../domain/entities/shopping-list.entity';
import type { IShoppingListRepository } from '../../../domain/repositories/shopping-list.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../../../domain/repositories/shopping-list.repository.interface';

@Injectable()
export class GetUserListsUseCase {
  constructor(
    @Inject(SHOPPING_LIST_REPOSITORY)
    private readonly listRepository: IShoppingListRepository,
  ) {}

  async execute(userId: string): Promise<ShoppingList[]> {
    return await this.listRepository.findByUserId(userId);
  }
}
