import { prisma, type IComunicado } from '@spd/db';
import type {
  CreateComunicadoDTO,
  UpdateComunicadoDTO,
  ComunicadoFilters
} from '../../dto/ComunicadoDTO';
import type { ComunicadoRepository } from '../ComunicadoRepository';
import type { Prisma } from '@prisma/client';

export class PrismaComunicadoRepository implements ComunicadoRepository {
  async list(filters?: ComunicadoFilters): Promise<IComunicado[]> {
    const where: Prisma.ComunicadoWhereInput = {};

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.responsavel) {
      where.responsavel = { contains: filters.responsavel };
    }

    if (filters?.search) {
      where.OR = [
        { assunto: { contains: filters.search } },
        { protocolo: { contains: filters.search } },
        { origem: { contains: filters.search } },
        { destino: { contains: filters.search } }
      ];
    }

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataRegistro = {};
      if (filters.dataInicio) {
        where.dataRegistro.gte = new Date(filters.dataInicio + 'T00:00:00');
      }
      if (filters.dataFim) {
        where.dataRegistro.lte = new Date(filters.dataFim + 'T23:59:59');
      }
    }

    return prisma.comunicado.findMany({
      where,
      orderBy: { dataRegistro: 'desc' }
    });
  }

  async findById(id: string): Promise<IComunicado | null> {
    return prisma.comunicado.findUnique({
      where: { id }
    });
  }

  async create(data: CreateComunicadoDTO): Promise<IComunicado> {
    return prisma.comunicado.create({ data });
  }

  async update(id: string, data: UpdateComunicadoDTO): Promise<IComunicado> {
    return prisma.comunicado.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.comunicado.delete({ where: { id } });
  }
}

