import { ShoppingList } from '../../../../domain/entities/shopping-list.entity';
import { ShoppingListSchema } from '../entities/shopping-list.schema';

export class ShoppingListMapper {
  static toPersistence(list: ShoppingList): ShoppingListSchema {
    const schema = new ShoppingListSchema();
    schema.id = list.id;
    schema.title = list.title;
    schema.description = list.description;
    schema.ownerId = list.ownerId;
    schema.createdAt = list.createdAt;
    schema.updatedAt = list.updatedAt;
    return schema;
  }

  static toDomain(schema: ShoppingListSchema): ShoppingList {
    return new ShoppingList({
      id: schema.id,
      title: schema.title,
      description: schema.description,
      ownerId: schema.ownerId,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }

  static toDomainArray(schemas: ShoppingListSchema[]): ShoppingList[] {
    return schemas.map((schema) => ShoppingListMapper.toDomain(schema));
  }
}
