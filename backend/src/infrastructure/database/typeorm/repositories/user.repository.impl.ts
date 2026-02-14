import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { UserSchema } from '../entities/user.schema';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repository: Repository<UserSchema>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? UserMapper.toDomain(schema) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const schema = await this.repository.findOne({ where: { email } });
    return schema ? UserMapper.toDomain(schema) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const schema = await this.repository.findOne({ where: { username } });
    return schema ? UserMapper.toDomain(schema) : null;
  }

  async save(user: User): Promise<User> {
    const schema = UserMapper.toPersistence(user);
    const savedSchema = await this.repository.save(schema);
    return UserMapper.toDomain(savedSchema);
  }
}
