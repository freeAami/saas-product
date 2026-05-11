import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { ClerkExpressWithAuth, StrictAuthProp } from '@clerk/clerk-sdk-node';
import { prisma } from '@saas/db';
import projectRoutes from './routes/projects';
import subscriptionRoutes, { handleStripeWebhook } from './routes/subscriptions';
import clerkWebhookRoutes from './routes/webhooks';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// Webhook endpoint needs raw body
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

app.use('/api/v1/webhooks', clerkWebhookRoutes);

// Clerk Authentication Middleware
app.use(ClerkExpressWithAuth());

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

// Routes
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

app.get('/api/v1/user/me', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;

  if (!clerkId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });

    // If user doesn't exist in our DB yet, we might want to create them
    // but usually this is handled by a webhook. 
    // For this task, we'll just return what we find or a 404 if not found in our DB.
    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default app;
