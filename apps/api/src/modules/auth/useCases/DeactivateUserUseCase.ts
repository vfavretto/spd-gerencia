import { AppError } from '@shared/errors/AppError';
import type { IUsuario } from '@spd/db';
import type { UserRepository } from '../repositories/UserRepository';

type Request = {
  userId: string;
  actorId: string;
};

type Response = {
  user: IUsuario;
  changed: boolean;
};

export class DeactivateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute({ userId, actorId }: Request): Promise<Response> {
    if (userId === actorId) {
      throw new AppError('Você não pode desativar a própria conta', 403);
    }

    const user = await this.repository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!user.ativo) {
      return { user, changed: false };
    }

    const updatedUser = await this.repository.update(userId, { ativo: false });

    return { user: updatedUser, changed: true };
  }
}
