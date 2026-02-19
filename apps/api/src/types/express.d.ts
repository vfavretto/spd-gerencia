import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      nome: string;
      email: string;
      role: string;
    };
  }
}
