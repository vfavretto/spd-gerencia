export interface CreateSnapshotDTO {
  convenioId: string;
  dados: Record<string, unknown>;
  criadoPorId?: string | null;
  criadoPorNome?: string | null;
  motivoSnapshot?: string | null;
}

export interface SnapshotResult {
  id: string;
  convenioId: string;
  versao: number;
  dados: Record<string, unknown>;
  criadoPorId: string | null;
  criadoPorNome: string | null;
  motivoSnapshot: string | null;
  criadoEm: Date;
}

export interface ISnapshotRepository {
  create(data: CreateSnapshotDTO): Promise<SnapshotResult>;
  findByConvenioId(convenioId: string): Promise<SnapshotResult[]>;
  findById(id: string): Promise<SnapshotResult | null>;
  findByConvenioIdAndVersao(convenioId: string, versao: number): Promise<SnapshotResult | null>;
  getNextVersao(convenioId: string): Promise<number>;
}
