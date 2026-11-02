import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  let controller: AuthController;

  const auth = {
    register: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: auth }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register() forwards the DTO to AuthService', async () => {
    const dto = { email: 'ada@example.com', name: 'Ada', password: 'secret-pass' };
    auth.register.mockResolvedValue({ access_token: 't', user: {} });

    await expect(controller.register(dto)).resolves.toEqual({
      access_token: 't',
      user: {},
    });
    expect(auth.register).toHaveBeenCalledWith(dto);
  });

  it('login() forwards the DTO to AuthService', async () => {
    const dto = { email: 'ada@example.com', password: 'secret-pass' };
    auth.login.mockResolvedValue({ access_token: 't', user: {} });

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 't',
      user: {},
    });
    expect(auth.login).toHaveBeenCalledWith(dto);
  });

  it('me() returns the user attached by the JWT guard', () => {
    const user = { id: 1, email: 'ada@example.com', name: 'Ada' };
    expect(controller.me(user)).toEqual(user);
  });
});
