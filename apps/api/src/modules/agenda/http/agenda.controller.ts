import type { Request, Response } from 'express';
import { z } from 'zod';
import { zLocalDate } from '@shared/schemas/dateSchema';
import { PrismaEventoRepository } from '../repositories/implementations/PrismaEventoRepository';
import { ListEventosUseCase } from '../useCases/ListEventosUseCase';
import { GetEventoUseCase } from '../useCases/GetEventoUseCase';
import { CreateEventoUseCase } from '../useCases/CreateEventoUseCase';
import { UpdateEventoUseCase } from '../useCases/UpdateEventoUseCase';
import { DeleteEventoUseCase } from '../useCases/DeleteEventoUseCase';
import { AppError } from '@shared/errors/AppError';

const createSchema = z.object({
  titulo: z.string().min(3),
  descricao: z.string().nullable().optional(),
  descricaoComplementar: z.string().nullable().optional(),
  tipo: z
    .enum([
      'REUNIAO',
      'PRESTACAO_CONTAS',
      'ENTREGA_DOCUMENTOS',
      'VENCIMENTO_ETAPA',
      'OUTROS'
    ])
    .nullable()
    .optional(),
  dataInicio: zLocalDate,
  dataFim: zLocalDate.nullable().optional(),
  local: z.string().nullable().optional(),
  responsavel: z.string().nullable().optional(),
  convenioId: z.string().nullable().optional()
});

const updateSchema = createSchema
  .partial()
  .extend({
    concluidoEm: zLocalDate.nullable().optional()
  });

export class AgendaController {
  private readonly repository = new PrismaEventoRepository();

  async index(_req: Request, res: Response) {
    const useCase = new ListEventosUseCase(this.repository);
    const eventos = await useCase.execute();
    return res.json(eventos);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
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
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const getUseCase = new GetEventoUseCase(this.repository);
    const existing = await getUseCase.execute(id);

    if (existing.origem === 'PENDENCIA') {
      const allowedKeys = ['descricaoComplementar', 'local', 'responsavel'] as const;
      const invalidFields = Object.keys(payload).filter(
        (key) => !allowedKeys.includes(key as (typeof allowedKeys)[number])
      );

      if (invalidFields.length > 0) {
        throw new AppError(
          'Eventos gerados por pendência só permitem editar observações, local e responsável',
          400
        );
      }
    }

    const useCase = new UpdateEventoUseCase(this.repository);
    const evento = await useCase.execute(id, payload);
    return res.json(evento);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const getUseCase = new GetEventoUseCase(this.repository);
    const existing = await getUseCase.execute(id);

    if (existing.origem === 'PENDENCIA') {
      throw new AppError(
        'Eventos automáticos de pendência devem ser removidos a partir da pendência de origem',
        400
      );
    }

    const useCase = new DeleteEventoUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}
