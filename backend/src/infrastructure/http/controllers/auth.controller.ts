import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { RegisterDto } from '../../../application/dto/auth/register.dto';
import { LoginDto } from '../../../application/dto/auth/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUserUseCase.execute(dto);

    // Не возвращаем passwordHash клиенту!
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return await this.loginUserUseCase.execute(dto);
  }
}
