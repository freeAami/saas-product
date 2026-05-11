import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '@saas/db';

vi.mock('@clerk/clerk-sdk-node', () => ({
  ClerkExpressWithAuth: () => (req: any, res: any, next: any) => {
    if (req.headers.authorization === 'Bearer valid_test_token') {
      req.auth = { userId: 'user_test_clerk_id' };
    } else {
      req.auth = { userId: null };
    }
    next();
  },
}));

vi.mock('@saas/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('GET /api/v1/user/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if no authentication token is provided', async () => {
    const response = await request(app).get('/api/v1/user/me');
    expect(response.status).toBe(401);
  });

  it('should return 200 and user data if valid token is provided', async () => {
    const mockUser = {
      id: 'user_1',
      clerkId: 'user_test_clerk_id',
      email: 'test@example.com',
      name: 'Test User',
      subscription: null,
    };

    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/api/v1/user/me')
      .set('Authorization', 'Bearer valid_test_token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 404 if user is not in database', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const response = await request(app)
      .get('/api/v1/user/me')
      .set('Authorization', 'Bearer valid_test_token');

    expect(response.status).toBe(404);
  });

  it('should handle Clerk webhook user.created and sync to database', async () => {
    const mockClerkData = {
      type: 'user.created',
      data: {
        id: 'user_clerk_123',
        email_addresses: [{ email_address: 'clerk@example.com' }],
        first_name: 'Clerk',
        last_name: 'User',
      },
    };

    vi.mocked(prisma.user.upsert).mockResolvedValue({ id: 'u1' } as any);

    const response = await request(app)
      .post('/api/v1/webhooks/clerk')
      .send(mockClerkData);

    expect(response.status).toBe(200);
    expect(prisma.user.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { clerkId: 'user_clerk_123' },
      create: expect.objectContaining({
        email: 'clerk@example.com',
      }),
    }));
  });
});
