import type { IUsuario } from '@spd/db';

export type CreateUserDTO = {
  nome: string;
  email: string;
  matricula: string;
  senha: string;
  role?: 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO' | 'OBSERVADOR';
};

export interface UserRepository {
  findByEmail(email: string): Promise<IUsuario | null>;
  findByMatricula(matricula: string): Promise<IUsuario | null>;
  create(data: CreateUserDTO): Promise<IUsuario>;
  findAll(): Promise<IUsuario[]>;
}
