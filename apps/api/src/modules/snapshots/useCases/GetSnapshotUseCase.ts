import type { ISnapshotRepository } from '../repositories/SnapshotRepository';
import { AppError } from '@shared/errors/AppError';

export class GetSnapshotUseCase {
  constructor(private snapshotRepository: ISnapshotRepository) {}

  async execute(id: string) {
    const snapshot = await this.snapshotRepository.findById(id);

    if (!snapshot) {
      throw new AppError('Snapshot não encontrado', 404);
    }

    return snapshot;
  }
}
