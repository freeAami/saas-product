import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">SaaS Product</h1>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-5xl font-bold tracking-tight mb-6">
          Build Better with Less
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The modern platform for teams to build, ship, and scale their products.
          Get started in minutes, not days.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}