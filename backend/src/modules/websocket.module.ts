import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ListsGateway } from '../infrastructure/websocket/lists.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'your-super-secret-jwt-key-change-in-production',
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  providers: [ListsGateway],
  exports: [ListsGateway],
})
export class WebSocketModule {}
