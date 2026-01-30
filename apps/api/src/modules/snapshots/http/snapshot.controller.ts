import type { Request, Response } from 'express';
import { PrismaSnapshotRepository } from '../repositories/implementations/PrismaSnapshotRepository';
import { ListSnapshotsUseCase } from '../useCases/ListSnapshotsUseCase';
import { GetSnapshotUseCase } from '../useCases/GetSnapshotUseCase';
import { GetSnapshotByVersaoUseCase } from '../useCases/GetSnapshotByVersaoUseCase';
import { CompareSnapshotsUseCase } from '../useCases/CompareSnapshotsUseCase';

const snapshotRepository = new PrismaSnapshotRepository();

export class SnapshotController {
  async index(req: Request, res: Response) {
    const { convenioId } = req.params;

    const listSnapshots = new ListSnapshotsUseCase(snapshotRepository);
    const snapshots = await listSnapshots.execute(convenioId);

    return res.json(snapshots);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const getSnapshot = new GetSnapshotUseCase(snapshotRepository);
    const snapshot = await getSnapshot.execute(id);

    return res.json(snapshot);
  }

  async showByVersao(req: Request, res: Response) {
    const { convenioId, versao } = req.params;

    const getSnapshot = new GetSnapshotByVersaoUseCase(snapshotRepository);
    const snapshot = await getSnapshot.execute(convenioId, Number(versao));

    return res.json(snapshot);
  }

  async compare(req: Request, res: Response) {
    const { convenioId } = req.params;
    const { versao1, versao2 } = req.query;

    if (!versao1 || !versao2) {
      return res.status(400).json({ 
        error: 'Os parâmetros versao1 e versao2 são obrigatórios' 
      });
    }

    const compareSnapshots = new CompareSnapshotsUseCase(snapshotRepository);
    const result = await compareSnapshots.execute(
      convenioId,
      Number(versao1),
      Number(versao2)
    );

    return res.json(result);
  }
}
