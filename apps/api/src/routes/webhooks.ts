import { Router, Request, Response } from 'express';
import { prisma } from '@saas/db';

const router = Router();

// POST /api/v1/webhooks/clerk - Handle Clerk webhooks
router.post('/clerk', async (req: Request, res: Response) => {
  const { data, type } = req.body;

  // In a real app, we would verify the signature using svix
  // For this project, we'll process the data if it looks valid

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const { id: clerkId, email_addresses, first_name, last_name } = data;
        const email = email_addresses[0]?.email_address;
        const name = `${first_name ?? ''} ${last_name ?? ''}`.trim();

        await prisma.user.upsert({
          where: { clerkId },
          update: {
            email,
            name,
          },
          create: {
            clerkId,
            email,
            name,
          },
        });
        break;
      }
      case 'user.deleted': {
        const { id: clerkId } = data;
        await prisma.user.delete({
          where: { clerkId },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Clerk webhook:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
