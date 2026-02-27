import type { IUsuario } from '@spd/db';
import { UsuarioRole } from '@prisma/client';

export type CreateUserDTO = {
  nome: string;
  email: string;
  matricula: string;
  senha: string;
  role?: UsuarioRole;
};

export interface UserRepository {
  findByEmail(email: string): Promise<IUsuario | null>;
  findByMatricula(matricula: string): Promise<IUsuario | null>;
  create(data: CreateUserDTO): Promise<IUsuario>;
  findAll(): Promise<IUsuario[]>;
}
