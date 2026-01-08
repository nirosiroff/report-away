import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
  async function middleware(req: any) {
    // Custom middleware logic if needed
  },
  {
    isReturnToCurrentPage: true,
    loginPage: "/api/auth/login",
    isAuthorized: ({ token }: { token: any }) => {
      // Basic check: if token exists, user is authorized.
      // You can add more granular checks here (e.g. roles)
      return token != null;
    },
    publicPaths: ["/", "/api/auth/login", "/api/auth/register", "/api/uploadthing"], // Add public paths here
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|.*\\..*).*)",
  ],
};
