import { Injectable, Inject, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { RegisterDto } from '../../dto/auth/register.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    // 1. Проверяем что email не занят
    const existingUserByEmail = await this.userRepository.findByEmail(
      dto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // 2. Проверяем что username не занят
    const existingUserByUsername = await this.userRepository.findByUsername(
      dto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // 3. Хешируем пароль
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 4. Создаем нового пользователя
    const newUser = new User({
      id: uuidv4(),
      username: dto.username,
      email: dto.email,
      passwordHash,
      createdAt: new Date(),
    });

    // 5. Сохраняем в БД
    return await this.userRepository.save(newUser);
  }
}
