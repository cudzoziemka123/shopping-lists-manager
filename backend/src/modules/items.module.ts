import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { ItemSchema } from '../infrastructure/database/typeorm/entities/item.schema';
import { ShoppingListSchema } from '../infrastructure/database/typeorm/entities/shopping-list.schema';
import { ListMemberSchema } from '../infrastructure/database/typeorm/entities/list-member.schema';
import { ItemRepositoryImpl } from '../infrastructure/database/typeorm/repositories/item.repository.impl';
import { ShoppingListRepositoryImpl } from '../infrastructure/database/typeorm/repositories/shopping-list.repository.impl';
import { ListMemberRepositoryImpl } from '../infrastructure/database/typeorm/repositories/list-member.repository.impl';
import { ItemsController } from '../infrastructure/http/controllers/items.controller';

// Application
import { CreateItemUseCase } from '../application/use-cases/items/create-item.use-case';
import { GetListItemsUseCase } from '../application/use-cases/items/get-list-items.use-case';
import { UpdateItemUseCase } from '../application/use-cases/items/update-item.use-case';
import { DeleteItemUseCase } from '../application/use-cases/items/delete-item.use-case';

// Domain
import { ITEM_REPOSITORY } from '../domain/repositories/item.repository.interface';
import { SHOPPING_LIST_REPOSITORY } from '../domain/repositories/shopping-list.repository.interface';
import { LIST_MEMBER_REPOSITORY } from '../domain/repositories/list-member.repository.interface';

// WebSocket
import { WebSocketModule } from './websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemSchema,
      ShoppingListSchema,
      ListMemberSchema,
    ]),
    WebSocketModule,
  ],
  controllers: [ItemsController],
  providers: [
    CreateItemUseCase,
    GetListItemsUseCase,
    UpdateItemUseCase,
    DeleteItemUseCase,
    {
      provide: ITEM_REPOSITORY,
      useClass: ItemRepositoryImpl,
    },
    {
      provide: SHOPPING_LIST_REPOSITORY,
      useClass: ShoppingListRepositoryImpl,
    },
    {
      provide: LIST_MEMBER_REPOSITORY,
      useClass: ListMemberRepositoryImpl,
    },
  ],
})
export class ItemsModule {}
