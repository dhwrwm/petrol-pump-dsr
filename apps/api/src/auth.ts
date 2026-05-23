import "./env.js";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getAppConfig } from "@petrol/config";
import { prisma } from "./lib/prisma.js";

const config = getAppConfig();

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  baseURL: `${config.apiUrl}/api/auth`,
  trustedOrigins: [config.webUrl],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
