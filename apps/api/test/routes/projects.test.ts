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
    },
    project: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user_1', clerkId: 'user_test_clerk_id' };

  describe('GET /api/v1/projects', () => {
    it('should return 200 and list of projects', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.project.findMany as any).mockResolvedValue([{ id: 'p1', name: 'Project 1' }]);

      const response = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', 'Bearer valid_test_token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Project 1');
    });

    it('should return 401 if unauthenticated', async () => {
      const response = await request(app).get('/api/v1/projects');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.project.create as any).mockResolvedValue({ id: 'p2', name: 'New Project' });

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', 'Bearer valid_test_token')
        .send({ name: 'New Project' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Project');
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return a specific project', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.project.findFirst as any).mockResolvedValue({ id: 'p1', name: 'Project 1' });

      const response = await request(app)
        .get('/api/v1/projects/p1')
        .set('Authorization', 'Bearer valid_test_token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('p1');
    });
  });
});
