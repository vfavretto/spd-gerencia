import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaEventoRepository } from '../repositories/implementations/PrismaEventoRepository';
import { ListEventosUseCase } from '../useCases/ListEventosUseCase';
import { GetEventoUseCase } from '../useCases/GetEventoUseCase';
import { CreateEventoUseCase } from '../useCases/CreateEventoUseCase';
import { UpdateEventoUseCase } from '../useCases/UpdateEventoUseCase';
import { DeleteEventoUseCase } from '../useCases/DeleteEventoUseCase';

const createSchema = z.object({
  titulo: z.string().min(3),
  descricao: z.string().optional(),
  tipo: z
    .enum([
      'REUNIAO',
      'PRESTACAO_CONTAS',
      'ENTREGA_DOCUMENTOS',
      'VENCIMENTO_ETAPA',
      'OUTROS'
    ])
    .optional(),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().nullable().optional(),
  local: z.string().optional(),
  responsavel: z.string().optional(),
  convenioId: z.number().int().nullable().optional()
});

const updateSchema = createSchema.partial();

export class AgendaController {
  private readonly repository = new PrismaEventoRepository();

  async index(_req: Request, res: Response) {
    const useCase = new ListEventosUseCase(this.repository);
    const eventos = await useCase.execute();
    return res.json(eventos);
  }

  async show(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new GetEventoUseCase(this.repository);
    const evento = await useCase.execute(id);
    return res.json(evento);
  }

  async create(req: Request, res: Response) {
    const payload = createSchema.parse(req.body);
    const useCase = new CreateEventoUseCase(this.repository);
    const evento = await useCase.execute({
      ...payload,
      convenioId: payload.convenioId ?? null
    });
    return res.status(201).json(evento);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateEventoUseCase(this.repository);
    const evento = await useCase.execute(id, payload);
    return res.json(evento);
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new DeleteEventoUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}
