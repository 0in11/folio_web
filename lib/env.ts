const requiredEnvKeys = ["DATABASE_URL", "PAYLOAD_SECRET"] as const;

type RequiredEnvKey = (typeof requiredEnvKeys)[number];
type RequiredEnv = Record<RequiredEnvKey, string>;

export function validateEnv(env: NodeJS.ProcessEnv = process.env): RequiredEnv {
  const missing = requiredEnvKeys.filter((key) => {
    const value = env[key];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  const databaseUrl = env.DATABASE_URL!.trim();
  const payloadSecret = env.PAYLOAD_SECRET!.trim();

  try {
    new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL must be a valid URL");
  }

  return {
    DATABASE_URL: databaseUrl,
    PAYLOAD_SECRET: payloadSecret,
  };
}

let _env: ReturnType<typeof validateEnv> | null = null;

export function getEnv(): RequiredEnv {
  if (!_env) {
    _env = validateEnv();
    process.env.DATABASE_URL = _env.DATABASE_URL;
    process.env.PAYLOAD_SECRET = _env.PAYLOAD_SECRET;
  }
  return _env;
}
