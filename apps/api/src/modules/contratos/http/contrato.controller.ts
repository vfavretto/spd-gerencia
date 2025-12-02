import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaContratoRepository } from '../repositories/implementations/PrismaContratoRepository';
import { ListContratosUseCase } from '../useCases/ListContratosUseCase';
import { GetContratoUseCase } from '../useCases/GetContratoUseCase';
import { CreateContratoUseCase } from '../useCases/CreateContratoUseCase';
import { UpdateContratoUseCase } from '../useCases/UpdateContratoUseCase';
import { DeleteContratoUseCase } from '../useCases/DeleteContratoUseCase';

const modalidadeLicitacaoEnum = z.enum([
  'PREGAO',
  'TOMADA_PRECOS',
  'CONCORRENCIA',
  'DISPENSA',
  'INEXIGIBILIDADE'
]);

const createSchema = z.object({
  numProcessoLicitatorio: z.string().optional(),
  modalidadeLicitacao: modalidadeLicitacaoEnum.optional(),
  numeroContrato: z.string().optional(),
  contratadaCnpj: z.string().optional(),
  contratadaNome: z.string().optional(),
  dataAssinatura: z.coerce.date().nullable().optional(),
  dataVigenciaInicio: z.coerce.date().nullable().optional(),
  dataVigenciaFim: z.coerce.date().nullable().optional(),
  dataOIS: z.coerce.date().nullable().optional(),
  valorContrato: z.number().min(0).optional(),
  valorExecutado: z.number().min(0).optional(),
  engenheiroResponsavel: z.string().optional(),
  creaEngenheiro: z.string().optional(),
  artRrt: z.string().optional(),
  situacao: z.string().optional(),
  observacoes: z.string().optional(),
  convenioId: z.number().int()
});

const updateSchema = createSchema.omit({ convenioId: true }).partial();

export class ContratoController {
  private readonly repository = new PrismaContratoRepository();

  async index(req: Request, res: Response) {
    const convenioId = Number(req.params.convenioId);
    const useCase = new ListContratosUseCase(this.repository);
    const contratos = await useCase.execute(convenioId);
    return res.json(contratos);
  }

  async show(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new GetContratoUseCase(this.repository);
    const contrato = await useCase.execute(id);
    return res.json(contrato);
  }

  async create(req: Request, res: Response) {
    const convenioId = Number(req.params.convenioId);
    const payload = createSchema.parse({ ...req.body, convenioId });
    const useCase = new CreateContratoUseCase(this.repository);
    const contrato = await useCase.execute(payload);
    return res.status(201).json(contrato);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateContratoUseCase(this.repository);
    const contrato = await useCase.execute(id, payload);
    return res.json(contrato);
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const useCase = new DeleteContratoUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}

