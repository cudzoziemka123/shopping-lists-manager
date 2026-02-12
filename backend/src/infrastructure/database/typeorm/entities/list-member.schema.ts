import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('list_members')
export class ListMemberSchema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'list_id', type: 'uuid' })
  listId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  role!: string;

  @Column({ name: 'joined_at', type: 'timestamp' })
  joinedAt!: Date;
}
