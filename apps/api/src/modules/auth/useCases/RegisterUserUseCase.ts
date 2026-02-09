import bcrypt from 'bcryptjs';
import { AppError } from '@shared/errors/AppError';
import type { UserRepository, CreateUserDTO } from '../repositories/UserRepository';

type Request = {
  nome: string;
  email: string;
  matricula: string;
  senha: string;
  role?: 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO' | 'OBSERVADOR';
};

type Response = {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  role: string;
};

export class RegisterUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute({ nome, email, matricula, senha, role }: Request): Promise<Response> {
    const existingEmail = await this.repository.findByEmail(email);
    if (existingEmail) {
      throw new AppError('Já existe um usuário com este e-mail', 409);
    }

    const existingMatricula = await this.repository.findByMatricula(matricula);
    if (existingMatricula) {
      throw new AppError('Já existe um usuário com esta matrícula', 409);
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const dto: CreateUserDTO = {
      nome,
      email,
      matricula,
      senha: hashedPassword,
      role: role ?? 'ANALISTA'
    };

    const user = await this.repository.create(dto);

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      matricula: user.matricula,
      role: user.role
    };
  }
}
