import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListMember } from '../../../../domain/entities/list-member.entity';
import { IListMemberRepository } from '../../../../domain/repositories/list-member.repository.interface';
import { ListMemberSchema } from '../entities/list-member.schema';
import { ListMemberMapper } from '../mappers/list-member.mapper';

@Injectable()
export class ListMemberRepositoryImpl implements IListMemberRepository {
  constructor(
    @InjectRepository(ListMemberSchema)
    private readonly repository: Repository<ListMemberSchema>,
  ) {}

  async findByListId(listId: string): Promise<ListMember[]> {
    const schemas = await this.repository.find({ where: { listId } });
    return ListMemberMapper.toDomainArray(schemas);
  }

  async findByUserAndList(
    userId: string,
    listId: string,
  ): Promise<ListMember | null> {
    const schema = await this.repository.findOne({
      where: { userId, listId },
    });
    return schema ? ListMemberMapper.toDomain(schema) : null;
  }

  async save(member: ListMember): Promise<ListMember> {
    const schema = ListMemberMapper.toPersistence(member);
    const savedSchema = await this.repository.save(schema);
    return ListMemberMapper.toDomain(savedSchema);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByUserAndList(userId: string, listId: string): Promise<void> {
    await this.repository.delete({ userId, listId });
  }
}
