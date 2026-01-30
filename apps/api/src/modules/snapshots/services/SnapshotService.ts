import { PrismaSnapshotRepository } from '../repositories/implementations/PrismaSnapshotRepository';
import { CreateSnapshotUseCase } from '../useCases/CreateSnapshotUseCase';

const snapshotRepository = new PrismaSnapshotRepository();
const createSnapshotUseCase = new CreateSnapshotUseCase(snapshotRepository);

export interface SnapshotUser {
  id: string;
  nome?: string;
}

/**
 * Serviço para criar snapshots de convênios.
 * Deve ser chamado antes de operações de UPDATE em convênios.
 */
export class SnapshotService {
  /**
   * Cria um snapshot do estado atual de um convênio.
   * Este método não lança exceções para não interferir no fluxo principal.
   */
  static async createSnapshot(
    convenioId: string,
    dadosAtuais: Record<string, unknown>,
    motivoSnapshot: string,
    user?: SnapshotUser
  ): Promise<void> {
    try {
      await createSnapshotUseCase.execute({
        convenioId,
        dados: dadosAtuais,
        criadoPorId: user?.id,
        criadoPorNome: user?.nome,
        motivoSnapshot
      });
    } catch (error) {
      // Log silencioso para não interferir no fluxo principal
      console.error('[SnapshotService] Erro ao criar snapshot:', error);
    }
  }

  /**
   * Cria snapshot antes de uma atualização de convênio.
   */
  static async beforeUpdate(
    convenioId: string,
    dadosAtuais: Record<string, unknown>,
    user?: SnapshotUser
  ): Promise<void> {
    await this.createSnapshot(convenioId, dadosAtuais, 'Alteração de dados', user);
  }

  /**
   * Cria snapshot quando um aditivo é adicionado.
   */
  static async onAditivo(
    convenioId: string,
    dadosAtuais: Record<string, unknown>,
    user?: SnapshotUser
  ): Promise<void> {
    await this.createSnapshot(convenioId, dadosAtuais, 'Adição de aditivo', user);
  }

  /**
   * Cria snapshot manual.
   */
  static async manual(
    convenioId: string,
    dadosAtuais: Record<string, unknown>,
    motivo: string,
    user?: SnapshotUser
  ): Promise<void> {
    await this.createSnapshot(convenioId, dadosAtuais, motivo, user);
  }
}
