import type { ISnapshotRepository } from '../repositories/SnapshotRepository';

export class ListSnapshotsUseCase {
  constructor(private snapshotRepository: ISnapshotRepository) {}

  async execute(convenioId: string) {
    return this.snapshotRepository.findByConvenioId(convenioId);
  }
}
