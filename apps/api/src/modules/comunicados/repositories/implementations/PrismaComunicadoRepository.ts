import { prisma, type Comunicado } from '@spd/db';
import type {
  CreateComunicadoDTO,
  UpdateComunicadoDTO
} from '../../dto/ComunicadoDTO';
import type { ComunicadoRepository } from '../ComunicadoRepository';

export class PrismaComunicadoRepository implements ComunicadoRepository {
  list(): Promise<Comunicado[]> {
    return prisma.comunicado.findMany({
      orderBy: { dataRegistro: 'desc' },
      include: {
        convenio: true
      }
    });
  }

  findById(id: number): Promise<Comunicado | null> {
    return prisma.comunicado.findUnique({
      where: { id },
      include: { convenio: true }
    });
  }

  create(data: CreateComunicadoDTO): Promise<Comunicado> {
    return prisma.comunicado.create({ data, include: { convenio: true } });
  }

  update(id: number, data: UpdateComunicadoDTO): Promise<Comunicado> {
    return prisma.comunicado.update({
      where: { id },
      data,
      include: { convenio: true }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.comunicado.delete({ where: { id } });
  }
}
