import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth.module';
import { ListsModule } from './modules/lists.module';
import { ItemsModule } from './modules/items.module';
import { WebSocketModule } from './modules/websocket.module';

@Module({
  imports: [
    // Загружаем переменные окружения из .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Настройка подключения к PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'shopping_lists',
      entities: [__dirname + '/**/*.schema{.ts,.js}'],
      synchronize: true,
    }),

    // Регистрируем AuthModule, ListsModule, ItemsModule и WebSocketModule
    AuthModule,
    ListsModule,
    ItemsModule,
    WebSocketModule,
  ],
})
export class AppModule {}
