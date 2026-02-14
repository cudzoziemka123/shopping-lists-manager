import {
  ListMember,
  MemberRole,
} from '../../../../domain/entities/list-member.entity';
import { ListMemberSchema } from '../entities/list-member.schema';

export class ListMemberMapper {
  static toPersistence(member: ListMember): ListMemberSchema {
    const schema = new ListMemberSchema();
    schema.id = member.id;
    schema.listId = member.listId;
    schema.userId = member.userId;
    schema.role = member.role;
    schema.joinedAt = member.joinedAt;
    return schema;
  }

  static toDomain(schema: ListMemberSchema): ListMember {
    return new ListMember({
      id: schema.id,
      listId: schema.listId,
      userId: schema.userId,
      role: schema.role as MemberRole,
      joinedAt: schema.joinedAt,
    });
  }

  static toDomainArray(schemas: ListMemberSchema[]): ListMember[] {
    return schemas.map((schema) => ListMemberMapper.toDomain(schema));
  }
}
