import { prisma, type IContratoExecucao } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { ContratoRepository } from '../ContratoRepository';
import type { CreateContratoDTO, UpdateContratoDTO } from '../../dto/ContratoDTO';

type ContratoWithMedicoes = Prisma.ContratoExecucaoGetPayload<{
  include: { medicoes: true };
}>;

export class PrismaContratoRepository implements ContratoRepository {
  private mapToDomain(contrato: ContratoWithMedicoes): IContratoExecucao {
    return {
      ...contrato,
      valorContrato: contrato.valorContrato ? contrato.valorContrato.toNumber() : contrato.valorContrato,
      valorExecutado: contrato.valorExecutado ? contrato.valorExecutado.toNumber() : contrato.valorExecutado,
      medicoes: contrato.medicoes.map((medicao) => ({
        ...medicao,
        percentualFisico: medicao.percentualFisico ? medicao.percentualFisico.toNumber() : medicao.percentualFisico,
        valorMedido: medicao.valorMedido.toNumber(),
        valorPago: medicao.valorPago ? medicao.valorPago.toNumber() : medicao.valorPago
      }))
    };
  }

  async listByConvenio(convenioId: string): Promise<IContratoExecucao[]> {
    const contratos = await prisma.contratoExecucao.findMany({
      where: { convenioId },
      include: {
        medicoes: true
      },
      orderBy: { criadoEm: 'desc' }
    });
    return contratos.map((contrato) => this.mapToDomain(contrato));
  }

  async findById(id: string): Promise<IContratoExecucao | null> {
    const contrato = await prisma.contratoExecucao.findUnique({
      where: { id },
      include: {
        medicoes: true
      }
    });
    if (!contrato) return null;
    return this.mapToDomain(contrato);
  }

  async findByIdWithMedicoes(id: string): Promise<IContratoExecucao | null> {
    const contrato = await prisma.contratoExecucao.findUnique({
      where: { id },
      include: {
        medicoes: {
          orderBy: { numeroMedicao: 'asc' }
        }
      }
    });
    if (!contrato) return null;
    return this.mapToDomain(contrato);
  }

  async create(data: CreateContratoDTO): Promise<IContratoExecucao> {
    const contrato = await prisma.contratoExecucao.create({
      data,
      include: {
        medicoes: true
      }
    });
    return this.mapToDomain(contrato);
  }

  async update(id: string, data: UpdateContratoDTO): Promise<IContratoExecucao> {
    const contrato = await prisma.contratoExecucao.update({
      where: { id },
      data,
      include: {
        medicoes: true
      }
    });
    return this.mapToDomain(contrato);
  }

  async delete(id: string): Promise<void> {
    await prisma.contratoExecucao.delete({ where: { id } });
  }
}
