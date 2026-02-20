import type { Request, Response } from 'express';
import { prisma } from '@spd/db';
import { GetDashboardResumoUseCase } from '../useCases/GetDashboardResumoUseCase';

export class DashboardController {
  async overview(_req: Request, res: Response) {
    const [totalConvenios, totalValorResult, proximasDatas, comunicadosPendentes] =
      await Promise.all([
        prisma.convenio.count(),
        prisma.convenio.aggregate({
          _sum: { valorGlobal: true }
        }),
        prisma.convenio.findMany({
          where: {
            dataFimVigencia: { gte: new Date() }
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
          where: { tipo: 'ENTRADA' }
        })
      ]);

    const porStatusResult = await prisma.convenio.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const porStatus = porStatusResult.map(item => ({
      status: item.status,
      _count: item._count.status
    }));

    return res.json({
      totalConvenios,
      totalValor: Number(totalValorResult._sum.valorGlobal ?? 0),
      comunicadosPendentes,
      porStatus,
      proximasDatas
    });
  }

  async resumo(_req: Request, res: Response) {
    const useCase = new GetDashboardResumoUseCase();
    const resumo = await useCase.execute();
    return res.json(resumo);
  }
}
