import type { Request, Response } from 'express';
import { z } from 'zod';
import { zLocalDate } from '@shared/schemas/dateSchema';
import { PrismaAditivoRepository } from '../repositories/implementations/PrismaAditivoRepository';
import { ListAditivosUseCase } from '../useCases/ListAditivosUseCase';
import { GetAditivoUseCase } from '../useCases/GetAditivoUseCase';
import { CreateAditivoUseCase } from '../useCases/CreateAditivoUseCase';
import { UpdateAditivoUseCase } from '../useCases/UpdateAditivoUseCase';
import { DeleteAditivoUseCase } from '../useCases/DeleteAditivoUseCase';
import { GetVigenciaAtualUseCase } from '../useCases/GetVigenciaAtualUseCase';

const tipoAditivoEnum = z.enum([
  'PRAZO',
  'VALOR',
  'PRAZO_E_VALOR',
  'SUPRESSAO',
  'ACRESCIMO'
]);

const createSchema = z.object({
  numeroAditivo: z.number().int().positive().nullable().optional(),
  tipoAditivo: tipoAditivoEnum,
  dataAssinatura: zLocalDate.nullable().optional(),
  novaVigencia: zLocalDate.nullable().optional(),
  valorAcrescimo: z.number().min(0).nullable().optional(),
  valorSupressao: z.number().min(0).nullable().optional(),
  motivo: z.string().nullable().optional(),
  justificativa: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  convenioId: z.string(),
  contratoId: z.string().nullable().optional()
});

const updateSchema = createSchema.omit({ convenioId: true, numeroAditivo: true, contratoId: true }).partial();

export class AditivoController {
  private readonly repository = new PrismaAditivoRepository();

  async index(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const useCase = new ListAditivosUseCase(this.repository);
    const aditivos = await useCase.execute(convenioId);
    return res.json(aditivos);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetAditivoUseCase(this.repository);
    const aditivo = await useCase.execute(id);
    return res.json(aditivo);
  }

  async create(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const payload = createSchema.parse({ ...req.body, convenioId });
    const useCase = new CreateAditivoUseCase(this.repository);
    const aditivo = await useCase.execute(payload);
    return res.status(201).json(aditivo);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateAditivoUseCase(this.repository);
    const aditivo = await useCase.execute(id, payload);
    return res.json(aditivo);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new DeleteAditivoUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }

  async vigencia(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const useCase = new GetVigenciaAtualUseCase(this.repository);
    const vigencia = await useCase.execute(convenioId);
    return res.json(vigencia);
  }
}
