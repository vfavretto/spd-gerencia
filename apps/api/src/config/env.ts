import path from 'node:path';
import dotenv from 'dotenv';

// Carrega primeiro a partir da pasta do workspace (apps/api/.env) caso exista.
dotenv.config();
// Em seguida tenta carregar a partir da raiz do monorepo.
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
  override: false
});

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Variável de ambiente ${key} não definida`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  databaseUrl: required(process.env.DATABASE_URL, 'DATABASE_URL')
};
