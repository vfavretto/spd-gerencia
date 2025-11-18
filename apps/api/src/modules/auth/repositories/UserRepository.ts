import type { Usuario, UsuarioRole } from '@spd/db';

export type CreateUserDTO = {
  nome: string;
  email: string;
  senha: string;
  role?: UsuarioRole;
};

export interface UserRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  create(data: CreateUserDTO): Promise<Usuario>;
}
