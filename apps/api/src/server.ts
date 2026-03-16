import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { routes } from './modules/routes';
import { errorHandler } from '@shared/middlewares/errorHandler';

// Lista de origens permitidas (CORS)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

export const createServer = () => {
  const app = express();

  // CORS com restrição de origens
  app.use(cors({
    origin: (origin, callback) => {
      // Permite requisições sem origem (ex: healthchecks, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }
      if (origin && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Origem não permitida pelo CORS'));
    },
    credentials: true
  }));

  // Limite de tamanho do body para evitar ataques de payload grande
  app.use(express.json({ limit: '10mb' }));

  // Headers de segurança
  app.use(helmet());

  // Logging apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      morgan('dev', {
        skip: () => process.env.NODE_ENV === 'test'
      })
    );
  }

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
};
