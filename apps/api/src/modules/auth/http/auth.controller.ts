import type { Request, Response } from 'express';
import { z } from 'zod';
import { MongooseUserRepository } from '../repositories/implementations/MongooseUserRepository';
import { AuthenticateUserUseCase } from '../useCases/AuthenticateUserUseCase';

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6)
});

export class AuthController {
  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);

    const repository = new MongooseUserRepository();
    const useCase = new AuthenticateUserUseCase(repository);

    const result = await useCase.execute(payload);

    return res.status(200).json(result);
  }
}
