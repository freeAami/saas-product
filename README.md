# SaaS Product Monorepo

Full-stack SaaS application: Next.js, Express, Prisma, Clerk, Stripe.

## Stack
- **Frontend**: Next.js 14 App Router, Tailwind CSS, Shadcn UI, TanStack Query, Zustand
- **Backend**: Express.js, TypeScript, Prisma ORM, Clerk auth, Stripe payments
- **Tests**: Vitest, Supertest, React Testing Library, Playwright
- **Deploy**: Vercel (frontend), Railway (backend)

## Structure
```
apps/web     # Next.js frontend
apps/api     # Express.js backend
packages/    # Shared: db, config, types
```

## Quick Start
```bash
pnpm install
pnpm dev
pnpm test
```

## Features
- Clerk authentication (sign-in/up, protected routes)
- Projects CRUD with auth protection
- Stripe subscription checkout + webhooks
- Subscription status (active/past_due/canceled)
- GitHub Actions CI/CD with auto-deploy
