import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '@saas/db';
import Stripe from 'stripe';

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
    },
    subscription: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
        },
      },
      webhooks: {
        constructEvent: vi.fn(),
      },
      subscriptions: {
        retrieve: vi.fn(),
      },
    })),
  };
});

describe('POST /api/v1/subscriptions/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/subscriptions/checkout')
      .send({ planId: 'price_123' });
    
    expect(response.status).toBe(401);
  });

  it('should return 200 and a checkout URL if authenticated and planId is valid', async () => {
    const mockUser = { id: 'user_1', clerkId: 'user_test_clerk_id', email: 'test@example.com' };
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/v1/subscriptions/checkout')
      .set('Authorization', 'Bearer valid_test_token')
      .send({ planId: 'price_123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toBe('https://checkout.stripe.com/test');
  });

  it('should return 400 if planId is missing', async () => {
    const response = await request(app)
      .post('/api/v1/subscriptions/checkout')
      .set('Authorization', 'Bearer valid_test_token')
      .send({ planId: '' });

    expect(response.status).toBe(400);
  });
});

describe('GET /api/v1/subscriptions/current', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    const response = await request(app).get('/api/v1/subscriptions/current');
    expect(response.status).toBe(401);
  });

  it('should return 200 and subscription data if authenticated', async () => {
    const mockSubscription = {
      id: 'sub_1',
      status: 'active',
      planId: 'price_123',
    };
    const mockUser = {
      id: 'user_1',
      clerkId: 'user_test_clerk_id',
      subscription: mockSubscription,
    };
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/api/v1/subscriptions/current')
      .set('Authorization', 'Bearer valid_test_token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSubscription);
  });

  it('should return 200 and null if user has no subscription', async () => {
    const mockUser = {
      id: 'user_1',
      clerkId: 'user_test_clerk_id',
      subscription: null,
    };
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    const response = await request(app)
      .get('/api/v1/subscriptions/current')
      .set('Authorization', 'Bearer valid_test_token');

    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});
