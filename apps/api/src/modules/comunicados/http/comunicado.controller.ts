import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaComunicadoRepository } from '../repositories/implementations/PrismaComunicadoRepository';
import { ListComunicadosUseCase } from '../useCases/ListComunicadosUseCase';
import { GetComunicadoUseCase } from '../useCases/GetComunicadoUseCase';
import { CreateComunicadoUseCase } from '../useCases/CreateComunicadoUseCase';
import { UpdateComunicadoUseCase } from '../useCases/UpdateComunicadoUseCase';
import { DeleteComunicadoUseCase } from '../useCases/DeleteComunicadoUseCase';

const createSchema = z.object({
  protocolo: z.string(),
  assunto: z.string().min(3),
  conteudo: z.string().optional(),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  status: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  responsavel: z.string().optional(),
  arquivoUrl: z.string().url().optional(),
  convenioId: z.number().int().nullable().optional()
});

const updateSchema = createSchema.partial();

export class ComunicadoController {
  private readonly repository = new PrismaComunicadoRepository();

  async index(_req: Request, res: Response) {
    const useCase = new ListComunicadosUseCase(this.repository);
    const comunicados = await useCase.execute();
    return res.json(comunicados);
  }

  async show(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new GetComunicadoUseCase(this.repository);
    const comunicado = await useCase.execute(id);
    return res.json(comunicado);
  }

  async create(req: Request, res: Response) {
    const payload = createSchema.parse(req.body);
    const useCase = new CreateComunicadoUseCase(this.repository);
    const comunicado = await useCase.execute({
      ...payload,
      convenioId: payload.convenioId ?? null
    });
    return res.status(201).json(comunicado);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateComunicadoUseCase(this.repository);
    const comunicado = await useCase.execute(id, payload);
    return res.json(comunicado);
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new DeleteComunicadoUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}
