import { prisma, type IMedicao } from '@spd/db';
import type { CreateMedicaoDTO } from '../dto/MedicaoDTO';
import type { MedicaoRepository } from '../repositories/MedicaoRepository';
import { AppError } from '@shared/errors/AppError';

export class CreateMedicaoUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  async execute(data: CreateMedicaoDTO): Promise<IMedicao> {
    // Buscar contrato para validações
    const contrato = await prisma.contratoExecucao.findUnique({
      where: { id: data.contratoId },
      select: { dataOIS: true, valorContrato: true }
    });

    if (!contrato) {
      throw new AppError('Contrato não encontrado', 404);
    }

    // Validação: Data da medição não pode ser anterior à OIS
    if (contrato.dataOIS && data.dataMedicao < contrato.dataOIS) {
      throw new AppError(
        'A data da medição não pode ser anterior à Ordem de Início de Serviço (OIS)',
        400
      );
    }

    // Validação: Somatório das medições não pode exceder o valor do contrato
    const totalMedido = await this.repository.getTotalMedido(data.contratoId);
    const valorContrato = Number(contrato.valorContrato ?? 0);
    
    if (totalMedido + data.valorMedido > valorContrato) {
      const saldoDisponivel = valorContrato - totalMedido;
      throw new AppError(
        `O valor da medição excede o saldo disponível do contrato. Saldo disponível: R$ ${saldoDisponivel.toFixed(2)}`,
        400
      );
    }

    // Obter próximo número de medição automaticamente se não informado
    const numeroMedicao = data.numeroMedicao || await this.repository.getNextNumeroMedicao(data.contratoId);

    const medicao = await this.repository.create({
      ...data,
      numeroMedicao
    });

    // Auto-atualizar valorExecutado do contrato
    const novoTotalMedido = await this.repository.getTotalMedido(data.contratoId);
    await prisma.contratoExecucao.update({
      where: { id: data.contratoId },
      data: { valorExecutado: novoTotalMedido }
    });

    return medicao;
  }
}
