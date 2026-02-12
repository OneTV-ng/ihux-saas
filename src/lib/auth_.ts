import { db } from "@/db";
import * as schema from "@/db/schema";
import { getAuthProvider } from "@/db/dialect";
import { sendEmail } from "@/lib/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { nextCookies } from "better-auth/next-js";

const statement = {
  user: ["create", "list", "set-role", "ban", "unban", "delete", "impersonate"],
} as const;

const ac = createAccessControl(statement);

const adminRole = ac.newRole({
  user: ["create", "list", "set-role", "ban", "unban", "delete", "impersonate"],
});

const sadminRole = ac.newRole({
  user: ["create", "list", "set-role", "ban", "unban", "delete", "impersonate"],
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: getAuthProvider(),
    schema: {
      ...schema,
      user: schema.user,
    },
  }),
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL as string],
  session: {
    // Default to 7 days, but allow override via maxAge (e.g., remember me)
    expiresIn: 60 * 60 * 24 * 90, // 90 days default
    updateAge: 60 * 60 * 24, // 1 day
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
    },
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    admin({
      ac,
      roles: {
        admin: adminRole,
        sadmin: sadminRole,
      },
      defaultRole: "new",
      adminRoles: ["admin", "sadmin"],
    }),
  ],
});
