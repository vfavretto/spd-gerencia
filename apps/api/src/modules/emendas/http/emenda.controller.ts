import type { Request, Response } from 'express';
import { z } from 'zod';
import { MongooseEmendaRepository } from '../repositories/implementations/MongooseEmendaRepository';
import { ListEmendasUseCase } from '../useCases/ListEmendasUseCase';
import { GetEmendaUseCase } from '../useCases/GetEmendaUseCase';
import { CreateEmendaUseCase } from '../useCases/CreateEmendaUseCase';
import { UpdateEmendaUseCase } from '../useCases/UpdateEmendaUseCase';
import { DeleteEmendaUseCase } from '../useCases/DeleteEmendaUseCase';

const createSchema = z.object({
  nomeParlamentar: z.string().min(1),
  partido: z.string().optional(),
  codigoEmenda: z.string().optional(),
  funcao: z.string().optional(),
  subfuncao: z.string().optional(),
  programa: z.string().optional(),
  valorIndicado: z.number().min(0).optional(),
  anoEmenda: z.number().int().optional(),
  convenioId: z.string()
});

const updateSchema = createSchema.omit({ convenioId: true }).partial();

export class EmendaController {
  private readonly repository = new MongooseEmendaRepository();

  async index(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const useCase = new ListEmendasUseCase(this.repository);
    const emendas = await useCase.execute(convenioId);
    return res.json(emendas);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetEmendaUseCase(this.repository);
    const emenda = await useCase.execute(id);
    return res.json(emenda);
  }

  async create(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const payload = createSchema.parse({ ...req.body, convenioId });
    const useCase = new CreateEmendaUseCase(this.repository);
    const emenda = await useCase.execute(payload);
    return res.status(201).json(emenda);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateEmendaUseCase(this.repository);
    const emenda = await useCase.execute(id, payload);
    return res.json(emenda);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new DeleteEmendaUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}
