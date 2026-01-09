import type { Request, Response } from 'express';
import { z } from 'zod';
import { MongooseConvenioRepository } from '../repositories/implementations/MongooseConvenioRepository';
import { ListConveniosLiteUseCase } from '../useCases/ListConveniosLiteUseCase';
import { GetConvenioUseCase } from '../useCases/GetConvenioUseCase';
import { CreateConvenioUseCase } from '../useCases/CreateConvenioUseCase';
import { UpdateConvenioUseCase } from '../useCases/UpdateConvenioUseCase';
import { DeleteConvenioUseCase } from '../useCases/DeleteConvenioUseCase';
import { GetValoresVigentesUseCase } from '../useCases/GetValoresVigentesUseCase';

const commonSchema = {
  codigo: z.string().min(1),
  titulo: z.string().min(1),
  objeto: z.string().min(1),
  descricao: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  valorGlobal: z.number().min(0),
  valorRepasse: z.number().min(0).nullable().optional(),
  valorContrapartida: z.number().min(0).nullable().optional(),
  dataAssinatura: z.coerce.date().nullable().optional(),
  dataInicioVigencia: z.coerce.date().nullable().optional(),
  dataFimVigencia: z.coerce.date().nullable().optional(),
  dataPrestacaoContas: z.coerce.date().nullable().optional(),
  status: z.enum(
    [
      'RASCUNHO',
      'EM_ANALISE',
      'APROVADO',
      'EM_EXECUCAO',
      'CONCLUIDO',
      'CANCELADO'
    ] as const
  ).optional(),
  secretariaId: z.string(),
  orgaoId: z.string().nullable().optional(),
  programaId: z.string().nullable().optional(),
  fonteId: z.string().nullable().optional()
};

const createSchema = z.object(commonSchema);
const updateSchema = createSchema.partial();

export class ConvenioController {
  private readonly repository = new MongooseConvenioRepository();

  async index(req: Request, res: Response) {
    const search = req.query.search?.toString();
    const status = req.query.status?.toString();
    const secretariaId = req.query.secretariaId?.toString();

    // Usa listLite para performance na listagem
    const useCase = new ListConveniosLiteUseCase(this.repository);
    const convenios = await useCase.execute({ search, status, secretariaId });
    return res.json(convenios);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetConvenioUseCase(this.repository);
    const convenio = await useCase.execute(id);
    return res.json(convenio);
  }

  async create(req: Request, res: Response) {
    const payload = createSchema.parse(req.body);
    const useCase = new CreateConvenioUseCase(this.repository);
    const convenio = await useCase.execute(payload);
    return res.status(201).json(convenio);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateConvenioUseCase(this.repository);
    const convenio = await useCase.execute(id, payload);
    return res.json(convenio);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new DeleteConvenioUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }

  async valoresVigentes(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetValoresVigentesUseCase(this.repository);
    const valores = await useCase.execute(id);
    return res.json(valores);
  }
}
