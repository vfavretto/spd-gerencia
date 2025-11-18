import type { Request, Response } from 'express';
import { prisma } from '@spd/db';

export class DashboardController {
  async overview(_req: Request, res: Response) {
    const [totalConvenios, totalValor, proximasDatas, comunicadosPendentes] =
      await Promise.all([
        prisma.convenio.count(),
        prisma.convenio.aggregate({
          _sum: { valorGlobal: true }
        }),
        prisma.convenio.findMany({
          where: {
            dataFimVigencia: {
              gte: new Date()
            }
          },
          select: {
            id: true,
            titulo: true,
            dataFimVigencia: true,
            status: true
          },
          orderBy: { dataFimVigencia: 'asc' },
          take: 5
        }),
        prisma.comunicado.count({
          where: {
            status: {
              in: ['PENDENTE', 'EM ANDAMENTO']
            }
          }
        })
      ]);

    const porStatus = await prisma.convenio.groupBy({
      by: ['status'],
      _count: true
    });

    return res.json({
      totalConvenios,
      totalValor: totalValor._sum.valorGlobal ?? 0,
      comunicadosPendentes,
      porStatus,
      proximasDatas
    });
  }
}
