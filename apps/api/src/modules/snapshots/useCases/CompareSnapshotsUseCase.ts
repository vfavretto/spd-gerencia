import type { ISnapshotRepository } from '../repositories/SnapshotRepository';
import { AppError } from '@shared/errors/AppError';

interface CompareResult {
  versao1: number;
  versao2: number;
  criadoEm1: Date;
  criadoEm2: Date;
  diferencas: {
    campo: string;
    valorAnterior: unknown;
    valorNovo: unknown;
  }[];
}

export class CompareSnapshotsUseCase {
  constructor(private snapshotRepository: ISnapshotRepository) {}

  async execute(convenioId: string, versao1: number, versao2: number): Promise<CompareResult> {
    const [snapshot1, snapshot2] = await Promise.all([
      this.snapshotRepository.findByConvenioIdAndVersao(convenioId, versao1),
      this.snapshotRepository.findByConvenioIdAndVersao(convenioId, versao2)
    ]);

    if (!snapshot1) {
      throw new AppError(`Snapshot da versão ${versao1} não encontrado`, 404);
    }

    if (!snapshot2) {
      throw new AppError(`Snapshot da versão ${versao2} não encontrado`, 404);
    }

    const diferencas = this.findDifferences(snapshot1.dados, snapshot2.dados);

    return {
      versao1: snapshot1.versao,
      versao2: snapshot2.versao,
      criadoEm1: snapshot1.criadoEm,
      criadoEm2: snapshot2.criadoEm,
      diferencas
    };
  }

  private findDifferences(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
    prefix = ''
  ): { campo: string; valorAnterior: unknown; valorNovo: unknown }[] {
    const diferencas: { campo: string; valorAnterior: unknown; valorNovo: unknown }[] = [];
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of allKeys) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const val1 = obj1[key];
      const val2 = obj2[key];

      // Ignora campos de metadados
      if (['id', 'criadoEm', 'atualizadoEm', '_id', '__v'].includes(key)) {
        continue;
      }

      if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
        // Recursão para objetos aninhados
        if (!Array.isArray(val1) && !Array.isArray(val2)) {
          diferencas.push(
            ...this.findDifferences(
              val1 as Record<string, unknown>,
              val2 as Record<string, unknown>,
              fullKey
            )
          );
        } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          diferencas.push({ campo: fullKey, valorAnterior: val1, valorNovo: val2 });
        }
      } else if (val1 !== val2) {
        diferencas.push({ campo: fullKey, valorAnterior: val1, valorNovo: val2 });
      }
    }

    return diferencas;
  }
}
