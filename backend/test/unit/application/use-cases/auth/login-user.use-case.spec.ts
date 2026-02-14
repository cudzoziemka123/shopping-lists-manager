import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUserUseCase } from '../../../../../src/application/use-cases/auth/login-user.use-case';
import { USER_REPOSITORY } from '../../../../../src/domain/repositories/user.repository.interface';
import { User } from '../../../../../src/domain/entities/user.entity';

const mockArgon2Verify = jest.fn();
jest.mock('hash-wasm', () => ({
  argon2Verify: (...args: unknown[]) => mockArgon2Verify(...args),
}));

const createMockUser = (overrides: Partial<User> = {}): User =>
  new User({
    id: 'user-1',
    username: 'jan',
    email: 'jan@example.com',
    passwordHash: 'encodedHash',
    createdAt: new Date(),
    ...overrides,
  });

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: { findByEmail: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    mockArgon2Verify.mockReset();
    userRepository = {
      findByEmail: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mockJwtToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get(LoginUserUseCase);
  });

  it('should return accessToken when credentials are valid', async () => {
    const user = createMockUser();
    userRepository.findByEmail.mockResolvedValue(user);
    mockArgon2Verify.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'jan@example.com',
      password: 'Secret123!',
    });

    expect(result).toEqual({ accessToken: 'mockJwtToken' });
    expect(userRepository.findByEmail).toHaveBeenCalledWith('jan@example.com');
    expect(mockArgon2Verify).toHaveBeenCalledWith({
      password: 'Secret123!',
      hash: user.passwordHash,
    });
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: user.id,
        email: user.email,
        username: user.username,
      }),
    );
  });

  it('should throw UnauthorizedException when user not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'Secret123!' }),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'Secret123!' }),
    ).rejects.toThrow('Invalid credentials');
    expect(mockArgon2Verify).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(createMockUser());
    mockArgon2Verify.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'jan@example.com', password: 'WrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      useCase.execute({ email: 'jan@example.com', password: 'WrongPassword' }),
    ).rejects.toThrow('Invalid credentials');
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
