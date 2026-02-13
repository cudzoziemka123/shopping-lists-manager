import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Infrastructure
import { UserSchema } from '../infrastructure/database/typeorm/entities/user.schema';
import { UserRepositoryImpl } from '../infrastructure/database/typeorm/repositories/user.repository.impl';
import { AuthController } from '../infrastructure/http/controllers/auth.controller';

// Application
import { RegisterUserUseCase } from '../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../application/use-cases/auth/login-user.use-case'; // ← Добавили

// Domain
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { JwtStrategy } from 'src/infrastructure/http/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([UserSchema]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'your-secret-key-change-in-production',
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [USER_REPOSITORY, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
