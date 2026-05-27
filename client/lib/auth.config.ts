import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const publicRoutes = [
  "/",
  "/about",
  "/blog",
  "/pricing",
  "/privacy-policy",
  "/terms-and-conditions",
];

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuth = nextUrl.pathname.startsWith("/auth");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

      if (isOnAuth) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Allow access to public routes
      if (isPublicRoute) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (isOnAdmin) {
        const role = (auth?.user as any)?.role;
        if (role !== "superadmin") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
