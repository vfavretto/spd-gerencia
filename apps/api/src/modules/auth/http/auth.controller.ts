import type { Request, Response } from 'express';
import { z } from 'zod';
import type { IUsuario } from '@spd/db';
import { PrismaUserRepository } from '../repositories/implementations/PrismaUserRepository';
import { AuthenticateUserUseCase } from '../useCases/AuthenticateUserUseCase';
import { RegisterUserUseCase } from '../useCases/RegisterUserUseCase';
import { UpdateUserUseCase } from '../useCases/UpdateUserUseCase';
import { DeactivateUserUseCase } from '../useCases/DeactivateUserUseCase';
import { AuditService } from '../../auditoria/services/AuditService';

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

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'ANALISTA', 'ESTAGIARIO', 'OBSERVADOR'])
});

const sanitizeUser = (user: IUsuario) => ({
  id: user.id,
  nome: user.nome,
  email: user.email,
  matricula: user.matricula,
  role: user.role,
  ativo: user.ativo,
  criadoEm: user.criadoEm
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

    return res.status(200).json(users.map(sanitizeUser));
  }

  async updateUser(req: Request, res: Response) {
    const payload = updateUserSchema.parse(req.body);
    const repository = new PrismaUserRepository();
    const existingUser = await repository.findById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const useCase = new UpdateUserUseCase(repository);
    const result = await useCase.execute({
      userId: req.params.id,
      actorId: req.user!.id,
      role: payload.role
    });

    if (result.changed) {
      await AuditService.logUpdate(
        { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
        'Usuario',
        result.user.id,
        sanitizeUser(existingUser) as unknown as Record<string, unknown>,
        sanitizeUser(result.user) as unknown as Record<string, unknown>,
        req.ip,
        req.get('user-agent')
      );
    }

    return res.status(200).json(sanitizeUser(result.user));
  }

  async deactivateUser(req: Request, res: Response) {
    const repository = new PrismaUserRepository();
    const existingUser = await repository.findById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const useCase = new DeactivateUserUseCase(repository);
    const result = await useCase.execute({
      userId: req.params.id,
      actorId: req.user!.id
    });

    if (result.changed) {
      await AuditService.logDelete(
        { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
        'Usuario',
        result.user.id,
        sanitizeUser(existingUser) as unknown as Record<string, unknown>,
        req.ip,
        req.get('user-agent')
      );
    }

    return res.status(204).send();
  }
}
