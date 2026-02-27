import { prisma, type IMedicao } from '@spd/db';
import type { UpdateMedicaoDTO } from '../dto/MedicaoDTO';
import type { MedicaoRepository } from '../repositories/MedicaoRepository';
import { AppError } from '@shared/errors/AppError';

export class UpdateMedicaoUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  async execute(id: string, data: UpdateMedicaoDTO): Promise<IMedicao> {
    const medicaoAtual = await this.repository.findById(id);
    if (!medicaoAtual) {
      throw new AppError('Medição não encontrada', 404);
    }

    // Se está atualizando o valor, validar contra o contrato
    if (data.valorMedido !== undefined) {
      const contrato = await prisma.contratoExecucao.findUnique({
        where: { id: medicaoAtual.contratoId },
        select: { valorContrato: true }
      });

      if (contrato) {
        const totalMedido = await this.repository.getTotalMedido(medicaoAtual.contratoId);
        const valorAtualMedicao = Number(medicaoAtual.valorMedido);
        const valorContrato = Number(contrato.valorContrato ?? 0);
        
        // Calcula saldo excluindo o valor atual da medição
        const saldoDisponivel = valorContrato - totalMedido + valorAtualMedicao;
        
        if (data.valorMedido > saldoDisponivel) {
          throw new AppError(
            `O valor da medição excede o saldo disponível do contrato. Saldo disponível: R$ ${saldoDisponivel.toFixed(2)}`,
            400
          );
        }
      }
    }

    // Se está atualizando a data, validar contra OIS
    if (data.dataMedicao) {
      const contrato = await prisma.contratoExecucao.findUnique({
        where: { id: medicaoAtual.contratoId },
        select: { dataOIS: true }
      });

      if (contrato?.dataOIS && data.dataMedicao < contrato.dataOIS) {
        throw new AppError(
          'A data da medição não pode ser anterior à Ordem de Início de Serviço (OIS)',
          400
        );
      }
    }

    const medicao = await this.repository.update(id, data);

    // Auto-atualizar valorExecutado do contrato
    const novoTotalMedido = await this.repository.getTotalMedido(medicaoAtual.contratoId);
    await prisma.contratoExecucao.update({
      where: { id: medicaoAtual.contratoId },
      data: { valorExecutado: novoTotalMedido }
    });

    return medicao;
  }
}
