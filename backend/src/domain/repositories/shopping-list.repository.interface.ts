import { ShoppingList } from '../entities/shopping-list.entity';

export interface IShoppingListRepository {
  findById(id: string): Promise<ShoppingList | null>;
  findByUserId(userId: string): Promise<ShoppingList[]>;
  save(list: ShoppingList): Promise<ShoppingList>;
  delete(id: string): Promise<void>;
  update(list: ShoppingList): Promise<ShoppingList>;
}

export const SHOPPING_LIST_REPOSITORY = 'SHOPPING_LIST_REPOSITORY';
