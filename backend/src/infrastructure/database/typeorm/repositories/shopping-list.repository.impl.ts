import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingList } from '../../../../domain/entities/shopping-list.entity';
import { IShoppingListRepository } from '../../../../domain/repositories/shopping-list.repository.interface';
import { ShoppingListSchema } from '../entities/shopping-list.schema';
import { ShoppingListMapper } from '../mappers/shopping-list.mapper';

@Injectable()
export class ShoppingListRepositoryImpl implements IShoppingListRepository {
  constructor(
    @InjectRepository(ShoppingListSchema)
    private readonly repository: Repository<ShoppingListSchema>,
  ) {}

  async findById(id: string): Promise<ShoppingList | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? ShoppingListMapper.toDomain(schema) : null;
  }

  async findByUserId(userId: string): Promise<ShoppingList[]> {
    // Находим все списки где пользователь является участником через list_members
    const schemas = await this.repository
      .createQueryBuilder('list')
      .innerJoin('list_members', 'member', 'member.list_id = list.id')
      .where('member.user_id = :userId', { userId })
      .orderBy('list.updated_at', 'DESC')
      .getMany();

    return ShoppingListMapper.toDomainArray(schemas);
  }

  async save(list: ShoppingList): Promise<ShoppingList> {
    const schema = ShoppingListMapper.toPersistence(list);
    const savedSchema = await this.repository.save(schema);
    return ShoppingListMapper.toDomain(savedSchema);
  }

  async update(list: ShoppingList): Promise<ShoppingList> {
    const schema = ShoppingListMapper.toPersistence(list);
    await this.repository.update(list.id, schema);
    const updatedSchema = await this.repository.findOne({
      where: { id: list.id },
    });
    return ShoppingListMapper.toDomain(updatedSchema!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
