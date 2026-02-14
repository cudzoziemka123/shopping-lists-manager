import {
  Item,
  ItemStatus,
  ItemPriority,
} from '../../../../domain/entities/item.entity';
import { ItemSchema } from '../entities/item.schema';

export class ItemMapper {
  static toPersistence(item: Item): ItemSchema {
    const schema = new ItemSchema();
    schema.id = item.id;
    schema.listId = item.listId;
    schema.name = item.name;
    schema.quantity = item.quantity;
    schema.unit = item.unit;
    schema.status = item.status;
    schema.priority = item.priority;
    schema.addedById = item.addedById;
    schema.purchasedById = item.purchasedById || null;
    schema.purchasedAt = item.purchasedAt || null;
    schema.createdAt = item.createdAt;
    schema.updatedAt = item.updatedAt;
    return schema;
  }

  static toDomain(schema: ItemSchema): Item {
    return new Item({
      id: schema.id,
      listId: schema.listId,
      name: schema.name,
      quantity: Number(schema.quantity), // decimal → number
      unit: schema.unit,
      status: schema.status as ItemStatus,
      priority: schema.priority as ItemPriority,
      addedById: schema.addedById,
      purchasedById: schema.purchasedById || null,
      purchasedAt: schema.purchasedAt || null,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  static toDomainArray(schemas: ItemSchema[]): Item[] {
    return schemas.map((schema) => ItemMapper.toDomain(schema));
  }
}
