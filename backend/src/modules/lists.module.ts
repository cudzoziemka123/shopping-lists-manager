import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { ShoppingListSchema } from '../infrastructure/database/typeorm/entities/shopping-list.schema';
import { ListMemberSchema } from '../infrastructure/database/typeorm/entities/list-member.schema';
import { ShoppingListRepositoryImpl } from '../infrastructure/database/typeorm/repositories/shopping-list.repository.impl';
import { ListMemberRepositoryImpl } from '../infrastructure/database/typeorm/repositories/list-member.repository.impl';
import { ListsController } from '../infrastructure/http/controllers/lists.controller';

// Application
import { CreateListUseCase } from '../application/use-cases/lists/create-list.use-case';
import { GetUserListsUseCase } from '../application/use-cases/lists/get-user-lists.use-case';
import { DeleteListUseCase } from '../application/use-cases/lists/delete-list.use-case';
import { AddMemberUseCase } from '../application/use-cases/lists/add-member.use-case';
import { GetListByIdUseCase } from '../application/use-cases/lists/get-list-by-id.use-case';

// Domain
import { SHOPPING_LIST_REPOSITORY } from '../domain/repositories/shopping-list.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../domain/repositories/list-member.repository.interface';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';

// Import User Repository from Auth Module
import { UserRepositoryImpl } from '../infrastructure/database/typeorm/repositories/user.repository.impl';
import { UserSchema } from '../infrastructure/database/typeorm/entities/user.schema';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ShoppingListSchema,
      ListMemberSchema,
      UserSchema,
    ]),
  ],
  controllers: [ListsController],
  providers: [
    CreateListUseCase,
    GetUserListsUseCase,
    DeleteListUseCase,
    AddMemberUseCase,
    GetListByIdUseCase,
    {
      provide: SHOPPING_LIST_REPOSITORY,
      useClass: ShoppingListRepositoryImpl,
    },
    {
      provide: LIST_MEMBER_REPOSITORY,
      useClass: ListMemberRepositoryImpl,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
})
export class ListsModule {}
