import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { AppError } from '@shared/errors/AppError';
import type { UserRepository } from '../repositories/UserRepository';

type Request = {
  matricula: string;
  senha: string;
};

type Response = {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    matricula: string;
    role: string;
  };
};

export class AuthenticateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute({ matricula, senha }: Request): Promise<Response> {
    const user = await this.repository.findByMatricula(matricula);

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    if (!user.ativo) {
      throw new AppError('Usuário desativado. Contate o administrador.', 401);
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = jwt.sign(
      { email: user.email, role: user.role, matricula: user.matricula, nome: user.nome },
      env.jwtSecret,
      {
        subject: user.id,
        expiresIn: '8h'
      }
    );

    return {
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        matricula: user.matricula,
        role: user.role
      }
    };
  }
}
