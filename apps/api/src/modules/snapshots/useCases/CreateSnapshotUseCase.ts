import type { ISnapshotRepository, CreateSnapshotDTO } from '../repositories/SnapshotRepository';

interface CreateSnapshotInput {
  convenioId: string;
  dados: Record<string, unknown>;
  criadoPorId?: string | null;
  criadoPorNome?: string | null;
  motivoSnapshot?: string | null;
}

export class CreateSnapshotUseCase {
  constructor(private snapshotRepository: ISnapshotRepository) {}

  async execute(input: CreateSnapshotInput) {
    const data: CreateSnapshotDTO = {
      convenioId: input.convenioId,
      dados: input.dados,
      criadoPorId: input.criadoPorId,
      criadoPorNome: input.criadoPorNome,
      motivoSnapshot: input.motivoSnapshot
    };

    return this.snapshotRepository.create(data);
  }
}
