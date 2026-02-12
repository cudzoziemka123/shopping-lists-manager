import { ListMember } from '../entities/list-member.entity';

export interface IListMemberRepository {
  findByListId(listId: string): Promise<ListMember[]>;
  findByUserAndList(userId: string, listId: string): Promise<ListMember | null>;
  save(member: ListMember): Promise<ListMember>;
  delete(id: string): Promise<void>;
  deleteByUserAndList(userId: string, listId: string): Promise<void>;
}

export const LIST_MEMBER_REPOSITORY = 'LIST_MEMBER_REPOSITORY';
