export type AppConfig = {
  nodeEnv: string;
  apiUrl: string;
  webUrl: string;
  port: number;
  databaseUrl: string;
  directUrl?: string;
  betterAuthSecret: string;
};

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getAppConfig = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  apiUrl: process.env.API_URL ?? "http://localhost:4000",
  webUrl: process.env.WEB_URL ?? "http://localhost:5173",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  directUrl: process.env.DIRECT_URL,
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
});
