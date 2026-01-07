import { UsuarioModel, type IUsuario } from '@spd/db';
import type { CreateUserDTO, UserRepository } from '../UserRepository';

export class MongooseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<IUsuario | null> {
    return UsuarioModel.findOne({ email }).exec();
  }

  async create(data: CreateUserDTO): Promise<IUsuario> {
    return UsuarioModel.create(data);
  }
}

