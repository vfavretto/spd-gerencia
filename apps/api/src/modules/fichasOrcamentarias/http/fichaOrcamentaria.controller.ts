import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaFichaOrcamentariaRepository } from '../repositories/implementations/PrismaFichaOrcamentariaRepository';
import { ListFichasOrcamentariasUseCase } from '../useCases/ListFichasOrcamentariasUseCase';
import { GetFichaOrcamentariaUseCase } from '../useCases/GetFichaOrcamentariaUseCase';
import { CreateFichaOrcamentariaUseCase } from '../useCases/CreateFichaOrcamentariaUseCase';
import { UpdateFichaOrcamentariaUseCase } from '../useCases/UpdateFichaOrcamentariaUseCase';
import { DeleteFichaOrcamentariaUseCase } from '../useCases/DeleteFichaOrcamentariaUseCase';

const createSchema = z.object({
  numero: z.string().min(1),
  tipo: z.enum(['REPASSE', 'CONTRAPARTIDA', 'EXCLUSIVO']),
  descricao: z.string().nullable().optional(),
  valor: z.number().min(0).nullable().optional(),
  convenioId: z.string()
});

const updateSchema = createSchema.omit({ convenioId: true }).partial();

export class FichaOrcamentariaController {
  private readonly repository = new PrismaFichaOrcamentariaRepository();

  async index(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const tipo = req.query.tipo as string | undefined;
    const useCase = new ListFichasOrcamentariasUseCase(this.repository);
    const fichas = await useCase.execute(convenioId, tipo);
    return res.json(fichas);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetFichaOrcamentariaUseCase(this.repository);
    const ficha = await useCase.execute(id);
    return res.json(ficha);
  }

  async create(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const payload = createSchema.parse({ ...req.body, convenioId });
    const useCase = new CreateFichaOrcamentariaUseCase(this.repository);
    const ficha = await useCase.execute(payload);
    return res.status(201).json(ficha);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateFichaOrcamentariaUseCase(this.repository);
    const ficha = await useCase.execute(id, payload);
    return res.json(ficha);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new DeleteFichaOrcamentariaUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}
