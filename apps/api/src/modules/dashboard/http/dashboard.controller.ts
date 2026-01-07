import type { Request, Response } from 'express';
import { ConvenioModel, ComunicadoModel } from '@spd/db';

export class DashboardController {
  async overview(_req: Request, res: Response) {
    const [totalConvenios, totalValorResult, proximasDatas, comunicadosPendentes] =
      await Promise.all([
        ConvenioModel.countDocuments(),
        ConvenioModel.aggregate([
          { $group: { _id: null, total: { $sum: '$valorGlobal' } } }
        ]),
        ConvenioModel.find({
          dataFimVigencia: { $gte: new Date() }
        })
          .select('titulo dataFimVigencia status')
          .sort({ dataFimVigencia: 1 })
          .limit(5)
          .lean(),
        ComunicadoModel.countDocuments({
          status: { $in: ['PENDENTE', 'EM ANDAMENTO'] }
        })
      ]);

    const porStatusResult = await ConvenioModel.aggregate([
      { $group: { _id: '$status', _count: { $sum: 1 } } }
    ]);

    const porStatus = porStatusResult.map(item => ({
      status: item._id,
      _count: item._count
    }));

    return res.json({
      totalConvenios,
      totalValor: totalValorResult[0]?.total ?? 0,
      comunicadosPendentes,
      porStatus,
      proximasDatas: proximasDatas.map(d => ({
        id: d._id.toString(),
        titulo: d.titulo,
        dataFimVigencia: d.dataFimVigencia,
        status: d.status
      }))
    });
  }
}
