import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth.module';
import { ListsModule } from './modules/lists.module';
import { ItemsModule } from './modules/items.module';

@Module({
  imports: [
    // Load environment variables from .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // PostgreSQL database connection configuration
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

    // Register AuthModule, ListsModule and other modules as they are created
    AuthModule,
    ListsModule,
    ItemsModule,
  ],
})
export class AppModule {}
