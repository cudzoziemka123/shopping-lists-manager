export enum MemberRole {
  OWNER = 'owner',
  MEMBER = 'member',
}

export class ListMember {
  id: string;
  listId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;

  constructor(data: {
    id: string;
    listId: string;
    userId: string;
    role: MemberRole;
    joinedAt: Date;
  }) {
    this.id = data.id;
    this.listId = data.listId;
    this.userId = data.userId;
    this.role = data.role;
    this.joinedAt = data.joinedAt;
  }
}
