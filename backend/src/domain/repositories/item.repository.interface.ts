import { Item } from '../entities/item.entity';

export interface IItemRepository {
  findById(id: string): Promise<Item | null>;
  findByListId(listId: string): Promise<Item[]>;
  save(item: Item): Promise<Item>;
  update(item: Item): Promise<Item>;
  delete(id: string): Promise<void>;
}

export const ITEM_REPOSITORY = 'ITEM_REPOSITORY';
