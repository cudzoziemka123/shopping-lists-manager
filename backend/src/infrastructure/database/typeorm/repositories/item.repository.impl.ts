import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../../../../domain/entities/item.entity';
import { IItemRepository } from '../../../../domain/repositories/item.repository.interface';
import { ItemSchema } from '../entities/item.schema';
import { ItemMapper } from '../mappers/item.mapper';

@Injectable()
export class ItemRepositoryImpl implements IItemRepository {
  constructor(
    @InjectRepository(ItemSchema)
    private readonly repository: Repository<ItemSchema>,
  ) {}

  async findById(id: string): Promise<Item | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? ItemMapper.toDomain(schema) : null;
  }

  async findByListId(listId: string): Promise<Item[]> {
    const schemas = await this.repository.find({
      where: { listId },
      order: { createdAt: 'ASC' },
    });
    return ItemMapper.toDomainArray(schemas);
  }

  async save(item: Item): Promise<Item> {
    const schema = ItemMapper.toPersistence(item);
    const savedSchema = await this.repository.save(schema);
    return ItemMapper.toDomain(savedSchema);
  }

  async update(item: Item): Promise<Item> {
    const schema = ItemMapper.toPersistence(item);
    await this.repository.update(item.id, schema);
    const updatedSchema = await this.repository.findOne({
      where: { id: item.id },
    });
    return ItemMapper.toDomain(updatedSchema!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
