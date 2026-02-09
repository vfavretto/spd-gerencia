import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaUserRepository } from '../repositories/implementations/PrismaUserRepository';
import { AuthenticateUserUseCase } from '../useCases/AuthenticateUserUseCase';
import { RegisterUserUseCase } from '../useCases/RegisterUserUseCase';

const loginSchema = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  senha: z.string().min(6)
});

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['ADMIN', 'ANALISTA', 'ESTAGIARIO', 'OBSERVADOR']).optional().default('ANALISTA')
});

export class AuthController {
  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);

    const repository = new PrismaUserRepository();
    const useCase = new AuthenticateUserUseCase(repository);

    const result = await useCase.execute(payload);

    return res.status(200).json(result);
  }

  async register(req: Request, res: Response) {
    const payload = registerSchema.parse(req.body);

    const repository = new PrismaUserRepository();
    const useCase = new RegisterUserUseCase(repository);

    const result = await useCase.execute(payload);

    return res.status(201).json(result);
  }

  async listUsers(_req: Request, res: Response) {
    const repository = new PrismaUserRepository();
    const users = await repository.findAll();

    const sanitized = users.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      matricula: u.matricula,
      role: u.role,
      ativo: u.ativo,
      criadoEm: u.criadoEm
    }));

    return res.status(200).json(sanitized);
  }
}
