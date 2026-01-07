import type { IUsuario } from '@spd/db';

export type CreateUserDTO = {
  nome: string;
  email: string;
  senha: string;
  role?: 'ADMINISTRADOR' | 'ANALISTA' | 'VISUALIZADOR';
};

export interface UserRepository {
  findByEmail(email: string): Promise<IUsuario | null>;
  create(data: CreateUserDTO): Promise<IUsuario>;
}
