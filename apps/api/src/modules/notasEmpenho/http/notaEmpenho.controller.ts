import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaNotaEmpenhoRepository } from '../repositories/implementations/PrismaNotaEmpenhoRepository';
import { ListNotasEmpenhoUseCase } from '../useCases/ListNotasEmpenhoUseCase';
import { GetNotaEmpenhoUseCase } from '../useCases/GetNotaEmpenhoUseCase';
import { CreateNotaEmpenhoUseCase } from '../useCases/CreateNotaEmpenhoUseCase';
import { UpdateNotaEmpenhoUseCase } from '../useCases/UpdateNotaEmpenhoUseCase';
import { DeleteNotaEmpenhoUseCase } from '../useCases/DeleteNotaEmpenhoUseCase';

const createSchema = z.object({
  numero: z.string().min(1),
  tipo: z.enum(['REPASSE', 'CONTRAPARTIDA', 'EXCLUSIVO']),
  valor: z.number().min(0),
  dataEmissao: z.string().or(z.date()),
  observacoes: z.string().nullable().optional(),
  convenioId: z.string()
});

const updateSchema = createSchema.omit({ convenioId: true }).partial();

export class NotaEmpenhoController {
  private readonly repository = new PrismaNotaEmpenhoRepository();

  async index(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const tipo = req.query.tipo as string | undefined;
    const useCase = new ListNotasEmpenhoUseCase(this.repository);
    const notas = await useCase.execute(convenioId, tipo);
    return res.json(notas);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetNotaEmpenhoUseCase(this.repository);
    const nota = await useCase.execute(id);
    return res.json(nota);
  }

  async create(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const payload = createSchema.parse({ ...req.body, convenioId });
    const useCase = new CreateNotaEmpenhoUseCase(this.repository);
    const nota = await useCase.execute(payload);
    return res.status(201).json(nota);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateNotaEmpenhoUseCase(this.repository);
    const nota = await useCase.execute(id, payload);
    return res.json(nota);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new DeleteNotaEmpenhoUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}
