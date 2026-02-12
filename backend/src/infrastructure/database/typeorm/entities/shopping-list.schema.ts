import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shopping_lists')
export class ShoppingListSchema {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
