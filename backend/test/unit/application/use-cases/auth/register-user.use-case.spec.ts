import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '../../../../../src/application/use-cases/auth/register-user.use-case';
import { USER_REPOSITORY } from '../../../../../src/domain/repositories/user.repository.interface';
import { User } from '../../../../../src/domain/entities/user.entity';

jest.mock('hash-wasm', () => ({
  argon2id: jest.fn().mockResolvedValue('mockEncodedHash'),
}));

const createMockUser = (overrides: Partial<User> = {}): User =>
  new User({
    id: 'user-1',
    username: 'jan',
    email: 'jan@example.com',
    passwordHash: 'hash',
    createdAt: new Date(),
    ...overrides,
  });

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: {
    findByEmail: jest.Mock;
    findByUsername: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByUsername: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((user: User) => Promise.resolve(user)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(RegisterUserUseCase);
  });

  it('should register user and return saved user', async () => {
    const dto = {
      username: 'jan',
      email: 'jan@example.com',
      password: 'Secret123!',
    };

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.username).toBe(dto.username);
    expect(result.email).toBe(dto.email);
    expect(result.passwordHash).toBeDefined();
    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(userRepository.findByUsername).toHaveBeenCalledWith(dto.username);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0][0];
    expect(savedUser.username).toBe(dto.username);
    expect(savedUser.email).toBe(dto.email);
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(createMockUser());

    await expect(
      useCase.execute({
        username: 'other',
        email: 'jan@example.com',
        password: 'Secret123!',
      }),
    ).rejects.toThrow(ConflictException);
    await expect(
      useCase.execute({
        username: 'other',
        email: 'jan@example.com',
        password: 'Secret123!',
      }),
    ).rejects.toThrow('Email already exists');
    expect(userRepository.findByUsername).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when username already exists', async () => {
    userRepository.findByUsername.mockResolvedValue(createMockUser());

    await expect(
      useCase.execute({
        username: 'jan',
        email: 'other@example.com',
        password: 'Secret123!',
      }),
    ).rejects.toThrow(ConflictException);
    await expect(
      useCase.execute({
        username: 'jan',
        email: 'other@example.com',
        password: 'Secret123!',
      }),
    ).rejects.toThrow('Username already exists');
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
