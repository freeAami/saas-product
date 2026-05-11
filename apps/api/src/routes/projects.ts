import { Router, Request, Response } from 'express';
import { prisma } from '@saas/db';

const router = Router();

// GET /api/v1/projects - List all projects for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;

  if (!clerkId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/v1/projects - Create a new project
router.post('/', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  const { name, description } = req.body;

  if (!clerkId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/v1/projects/:id - Get a single project
router.get('/:id', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  const { id } = req.params;

  if (!clerkId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/v1/projects/:id - Update a project
router.put('/:id', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  const { id } = req.params;
  const { name, description } = req.body;

  if (!clerkId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: name ?? existingProject.name,
        description: description ?? existingProject.description,
      },
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/v1/projects/:id - Delete a project
router.delete('/:id', async (req: Request, res: Response) => {
  const clerkId = req.auth.userId;
  const { id } = req.params;

  if (!clerkId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
