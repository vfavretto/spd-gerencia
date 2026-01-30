import type { ISnapshotRepository } from '../repositories/SnapshotRepository';
import { AppError } from '@shared/errors/AppError';

export class GetSnapshotByVersaoUseCase {
  constructor(private snapshotRepository: ISnapshotRepository) {}

  async execute(convenioId: string, versao: number) {
    const snapshot = await this.snapshotRepository.findByConvenioIdAndVersao(convenioId, versao);

    if (!snapshot) {
      throw new AppError('Snapshot não encontrado para esta versão', 404);
    }

    return snapshot;
  }
}
