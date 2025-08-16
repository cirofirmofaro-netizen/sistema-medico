import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  
  // JWT
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Storage
  STORAGE_PROVIDER: z.enum(['S3']).default('S3'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID é obrigatório'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY é obrigatório'),
  AWS_REGION: z.string().default('us-east-1'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET é obrigatório'),
  S3_FORCE_PATH_STYLE: z.string().transform(val => val === 'true').default('true'),
  PRESIGN_EXPIRES_SECONDS: z.string().transform(val => parseInt(val, 10)).default('300'),
  
  // Upload com revisão
  UPLOAD_TEMP_BUCKET: z.string().min(1, 'UPLOAD_TEMP_BUCKET é obrigatório'),
  PRESIGN_EXPIRES_SECONDS_TEMP: z.string().transform(val => parseInt(val, 10)).default('600'),
  MAX_UPLOAD_MB: z.string().transform(val => parseInt(val, 10)).default('50'),
  MIME_WHITELIST: z.string().default('image/png,image/jpeg,application/pdf'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error('❌ Erro de validação das variáveis de ambiente:');
  envParse.error.errors.forEach((error) => {
    console.error(` - ${error.path.join('.')}: ${error.message}`);
  });
  process.exit(1);
}

export const env = envParse.data;

// Tipos derivados do schema
export type Env = z.infer<typeof envSchema>;
