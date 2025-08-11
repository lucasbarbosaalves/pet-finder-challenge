import z from 'zod';

const HTTP_PORT = 3333;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  HTTP_PORT: z.coerce.number().min(1024).max(65535).default(HTTP_PORT),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', z.treeifyError(_env.error));
  process.exit(1);
}

export const env = _env.data;
