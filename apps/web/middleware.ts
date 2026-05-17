import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please update this to allow specific routes that don't need authentication
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/api/v1/health"],
});

export const config = {
  matcher: ["/((?!.+\\.[\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};