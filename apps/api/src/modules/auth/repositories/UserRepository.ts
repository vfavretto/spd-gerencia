import type { IUsuario } from '@spd/db';
import { UsuarioRole } from '@prisma/client';

export type CreateUserDTO = {
  nome: string;
  email: string;
  matricula: string;
  senha: string;
  role?: UsuarioRole;
};

export type UpdateUserDTO = {
  role?: UsuarioRole;
  ativo?: boolean;
};

export interface UserRepository {
  findById(id: string): Promise<IUsuario | null>;
  findByEmail(email: string): Promise<IUsuario | null>;
  findByMatricula(matricula: string): Promise<IUsuario | null>;
  create(data: CreateUserDTO): Promise<IUsuario>;
  update(id: string, data: UpdateUserDTO): Promise<IUsuario>;
  findAll(): Promise<IUsuario[]>;
}
