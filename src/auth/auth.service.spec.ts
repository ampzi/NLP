import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { UserService } from '../user/user.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const createdUser = {
    id: 1,
    email: 'ada@example.com',
    name: 'Ada',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const users = {
    findByEmail: vi.fn(),
    findByEmailWithPassword: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  };

  const jwt = { sign: vi.fn().mockReturnValue('signed.jwt.token') };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('hashes the password and never returns it', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue(createdUser);

      const dto = { email: 'ada@example.com', name: 'Ada', password: 'secret-pass' };
      const result = await service.register(dto);

      // password reaching the DB must be a bcrypt hash, not plaintext
      const storedPassword = users.create.mock.calls[0][0].password;
      expect(storedPassword).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, storedPassword)).toBe(true);

      expect(result.user).toEqual({
        id: 1,
        email: 'ada@example.com',
        name: 'Ada',
      });
      expect(JSON.stringify(result)).not.toContain('secret-pass');
      expect(result.access_token).toBe('signed.jwt.token');
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'ada@example.com',
        name: 'Ada',
      });
    });

    it('rejects an already registered email', async () => {
      users.findByEmail.mockResolvedValue(createdUser);

      await expect(
        service.register({ email: 'ada@example.com', name: 'Ada', password: 'secret-pass' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(users.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const password = 'secret-pass';

    it('returns a token for valid credentials', async () => {
      const hash = await bcrypt.hash(password, 4);
      users.findByEmailWithPassword.mockResolvedValue({ ...createdUser, password: hash });

      const result = await service.login({ email: createdUser.email, password });

      expect(result.access_token).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: 1,
        email: 'ada@example.com',
        name: 'Ada',
      });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'ada@example.com',
        name: 'Ada',
      });
    });

    it('rejects a wrong password', async () => {
      const hash = await bcrypt.hash(password, 4);
      users.findByEmailWithPassword.mockResolvedValue({ ...createdUser, password: hash });

      await expect(
        service.login({ email: createdUser.email, password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('rejects an unknown email with the same error as a bad password', async () => {
      users.findByEmailWithPassword.mockResolvedValue(null);

      const err = await service
        .login({ email: 'nobody@example.com', password })
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(UnauthorizedException);
      expect((err as UnauthorizedException).message).toBe('Invalid credentials');
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});
