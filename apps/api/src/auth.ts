import "./env.js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getAppConfig } from "@petrol/config";
import { prisma } from "./lib/prisma.js";

const config = getAppConfig();

const isProduction = config.nodeEnv === "production";

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  baseURL: `${config.apiUrl}/api/auth`,
  trustedOrigins: [config.webUrl],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    // SameSite=None is required for cross-origin cookie sending in production
    // (API on onrender.com is a different site from the web app)
    ...(isProduction && {
      defaultCookieAttributes: { sameSite: "none", secure: true },
    }),
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "MANAGER",
        input: false,
      },
      stationId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
