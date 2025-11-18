import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';
import { AppError } from '@shared/errors/AppError';
import type { UserRepository } from '../repositories/UserRepository';

type Request = {
  email: string;
  senha: string;
};

type Response = {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    role: string;
  };
};

export class AuthenticateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute({ email, senha }: Request): Promise<Response> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      env.jwtSecret,
      {
        subject: String(user.id),
        expiresIn: '8h'
      }
    );

    return {
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    };
  }
}
