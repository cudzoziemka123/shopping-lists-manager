import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { argon2id } from 'hash-wasm';
import { randomUUID } from 'crypto';
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
    // 1. Check that email is not taken
    const existingUserByEmail = await this.userRepository.findByEmail(
      dto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // 2. Check that username is not taken
    const existingUserByUsername = await this.userRepository.findByUsername(
      dto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // 3. Hash the password
    const passwordHash = await argon2id({
      password: dto.password,
      salt: randomUUID().replace(/-/g, '').slice(0, 16), // 16 bytes salt
      parallelism: 1,
      iterations: 256,
      memorySize: 512,
      hashLength: 32,
      outputType: 'encoded',
    });

    // 4. Create a new user
    const newUser = new User({
      id: randomUUID(),
      username: dto.username,
      email: dto.email,
      passwordHash,
      createdAt: new Date(),
    });

    // 5. Save to database
    return await this.userRepository.save(newUser);
  }
}
