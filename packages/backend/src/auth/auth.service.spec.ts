import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService.register', () => {
  const usersService: any = { findByEmail: jest.fn(), create: jest.fn() };
  const jwt: any = { sign: jest.fn() };
  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AuthService(usersService, jwt);
  });

  it('rejects duplicate emails (case-insensitive)', async () => {
    usersService.findByEmail.mockResolvedValue({ id: '1' });
    await expect(
      service.register({ email: 'A@B.com', password: 'password1', firstName: 'a', lastName: 'b' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.findByEmail).toHaveBeenCalledWith('a@b.com');
  });

  it('only persists whitelisted fields, hashes the password and defaults to ATTENDEE', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(async (d: any) => ({ id: 'u1', ...d }));

    const dto: any = { email: 'x@y.com', password: 'password1', firstName: 'a', lastName: 'b', isAdmin: true, stripeAccountId: 'acct_evil' };
    const result: any = await service.register(dto);

    const saved = usersService.create.mock.calls[0][0];
    expect(saved.role).toBe('ATTENDEE');
    expect(saved).not.toHaveProperty('stripeAccountId');
    expect(saved).not.toHaveProperty('isAdmin');
    expect(saved.password).not.toBe('password1');
    expect(result).not.toHaveProperty('password');
  });
});
