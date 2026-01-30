import { PrismaClient, type Prisma } from '@prisma/client';
import type {
  ISnapshotRepository,
  CreateSnapshotDTO,
  SnapshotResult
} from '../SnapshotRepository';

const prisma = new PrismaClient();

export class PrismaSnapshotRepository implements ISnapshotRepository {
  async create(data: CreateSnapshotDTO): Promise<SnapshotResult> {
    const versao = await this.getNextVersao(data.convenioId);

    const snapshot = await prisma.convenioSnapshot.create({
      data: {
        convenioId: data.convenioId,
        versao,
        dados: data.dados as Prisma.InputJsonValue,
        criadoPorId: data.criadoPorId,
        criadoPorNome: data.criadoPorNome,
        motivoSnapshot: data.motivoSnapshot
      }
    });

    return {
      ...snapshot,
      dados: snapshot.dados as Record<string, unknown>
    };
  }

  async findByConvenioId(convenioId: string): Promise<SnapshotResult[]> {
    const snapshots = await prisma.convenioSnapshot.findMany({
      where: { convenioId },
      orderBy: { versao: 'desc' }
    });

    return snapshots.map(s => ({
      ...s,
      dados: s.dados as Record<string, unknown>
    }));
  }

  async findById(id: string): Promise<SnapshotResult | null> {
    const snapshot = await prisma.convenioSnapshot.findUnique({
      where: { id }
    });

    if (!snapshot) return null;

    return {
      ...snapshot,
      dados: snapshot.dados as Record<string, unknown>
    };
  }

  async findByConvenioIdAndVersao(convenioId: string, versao: number): Promise<SnapshotResult | null> {
    const snapshot = await prisma.convenioSnapshot.findUnique({
      where: {
        convenioId_versao: {
          convenioId,
          versao
        }
      }
    });

    if (!snapshot) return null;

    return {
      ...snapshot,
      dados: snapshot.dados as Record<string, unknown>
    };
  }

  async getNextVersao(convenioId: string): Promise<number> {
    const lastSnapshot = await prisma.convenioSnapshot.findFirst({
      where: { convenioId },
      orderBy: { versao: 'desc' },
      select: { versao: true }
    });

    return (lastSnapshot?.versao ?? 0) + 1;
  }
}
