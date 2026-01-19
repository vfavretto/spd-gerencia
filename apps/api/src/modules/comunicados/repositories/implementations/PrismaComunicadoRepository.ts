import { prisma, type IComunicado } from '@spd/db';
import type {
  CreateComunicadoDTO,
  UpdateComunicadoDTO
} from '../../dto/ComunicadoDTO';
import type { ComunicadoRepository } from '../ComunicadoRepository';

export class PrismaComunicadoRepository implements ComunicadoRepository {
  async list(): Promise<IComunicado[]> {
    return prisma.comunicado.findMany({
      include: { convenio: true },
      orderBy: { dataRegistro: 'desc' }
    });
  }

  async findById(id: string): Promise<IComunicado | null> {
    return prisma.comunicado.findUnique({
      where: { id },
      include: { convenio: true }
    });
  }

  async create(data: CreateComunicadoDTO): Promise<IComunicado> {
    return prisma.comunicado.create({
      data,
      include: { convenio: true }
    });
  }

  async update(id: string, data: UpdateComunicadoDTO): Promise<IComunicado> {
    return prisma.comunicado.update({
      where: { id },
      data,
      include: { convenio: true }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.comunicado.delete({ where: { id } });
  }
}
