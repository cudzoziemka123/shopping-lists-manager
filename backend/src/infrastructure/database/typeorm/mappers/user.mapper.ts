import { User } from '../../../../domain/entities/user.entity';
import { UserSchema } from '../entities/user.schema';

export class UserMapper {
  // Из Domain Entity в TypeORM Schema
  static toPersistence(user: User): UserSchema {
    const schema = new UserSchema();
    schema.id = user.id;
    schema.username = user.username;
    schema.email = user.email;
    schema.passwordHash = user.passwordHash;
    schema.createdAt = user.createdAt;
    return schema;
  }

  // Из TypeORM Schema в Domain Entity
  static toDomain(schema: UserSchema): User {
    return new User({
      id: schema.id,
      username: schema.username,
      email: schema.email,
      passwordHash: schema.passwordHash,
      createdAt: schema.createdAt,
    });
  }

  // Для массивов
  static toDomainArray(schemas: UserSchema[]): User[] {
    return schemas.map((schema) => UserMapper.toDomain(schema));
  }
}
