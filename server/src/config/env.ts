import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from current working directory or server folder
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/ai_helpdesk'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('helpdesk_jwt_super_secure_secret_key_minimum_32_chars_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().optional().default(''),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_MAX_SIZE: z.string().transform((val) => parseInt(val, 10)).default('10485760'), // 10MB default
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
