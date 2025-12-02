import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaPendenciaRepository } from '../repositories/implementations/PrismaPendenciaRepository';
import { ListPendenciasUseCase } from '../useCases/ListPendenciasUseCase';
import { GetPendenciaUseCase } from '../useCases/GetPendenciaUseCase';
import { CreatePendenciaUseCase } from '../useCases/CreatePendenciaUseCase';
import { UpdatePendenciaUseCase } from '../useCases/UpdatePendenciaUseCase';
import { DeletePendenciaUseCase } from '../useCases/DeletePendenciaUseCase';

const statusEnum = z.enum(['ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA', 'CANCELADA']);

const createSchema = z.object({
  descricao: z.string().min(1),
  responsavel: z.string().optional(),
  prazo: z.coerce.date().nullable().optional(),
  status: statusEnum.optional(),
  prioridade: z.number().int().min(1).max(3).optional(),
  resolucao: z.string().optional(),
  dataResolucao: z.coerce.date().nullable().optional(),
  convenioId: z.number().int()
});

const updateSchema = createSchema.omit({ convenioId: true }).partial();

export class PendenciaController {
  private readonly repository = new PrismaPendenciaRepository();

  async index(req: Request, res: Response) {
    const convenioId = Number(req.params.convenioId);
    const status = req.query.status?.toString();
    const prioridade = req.query.prioridade ? Number(req.query.prioridade) : undefined;

    const useCase = new ListPendenciasUseCase(this.repository);
    const pendencias = await useCase.execute(convenioId, { status, prioridade });
    return res.json(pendencias);
  }

  async show(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new GetPendenciaUseCase(this.repository);
    const pendencia = await useCase.execute(id);
    return res.json(pendencia);
  }

  async create(req: Request, res: Response) {
    const convenioId = Number(req.params.convenioId);
    const userId = (req as any).user?.id;
    const payload = createSchema.parse({ ...req.body, convenioId });
    const useCase = new CreatePendenciaUseCase(this.repository);
    const pendencia = await useCase.execute({ ...payload, criadoPorId: userId });
    return res.status(201).json(pendencia);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdatePendenciaUseCase(this.repository);
    const pendencia = await useCase.execute(id, payload);
    return res.json(pendencia);
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new DeletePendenciaUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }

  async countByStatus(req: Request, res: Response) {
    const convenioId = Number(req.params.convenioId);
    const counts = await this.repository.countByStatus(convenioId);
    return res.json(counts);
  }
}

