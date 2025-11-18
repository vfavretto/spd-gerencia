import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { routes } from './modules/routes';
import { errorHandler } from '@shared/middlewares/errorHandler';

export const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(helmet());
  app.use(
    morgan('dev', {
      skip: () => process.env.NODE_ENV === 'test'
    })
  );

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
};
