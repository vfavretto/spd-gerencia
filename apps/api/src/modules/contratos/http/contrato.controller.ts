import type { Request, Response } from 'express';
import { z } from 'zod';
import { zLocalDate } from '@shared/schemas/dateSchema';
import { PrismaContratoRepository } from '../repositories/implementations/PrismaContratoRepository';
import { PrismaConvenioRepository } from '../../convenios/repositories/implementations/PrismaConvenioRepository';
import { ConvenioStatusService } from '../../convenios/services/ConvenioStatusService';
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
  numProcessoLicitatorio: z.string().optional().nullable(),
  modalidadeLicitacao: modalidadeLicitacaoEnum.optional().nullable(),
  numeroContrato: z.string().optional().nullable(),
  contratadaCnpj: z.string().optional().nullable(),
  contratadaNome: z.string().optional().nullable(),
  dataAssinatura: zLocalDate.nullable().optional(),
  dataVigenciaInicio: zLocalDate.nullable().optional(),
  dataVigenciaFim: zLocalDate.nullable().optional(),
  dataOIS: zLocalDate.nullable().optional(),
  valorContrato: z.number().min(0).optional().nullable(),
  valorExecutado: z.number().min(0).optional().nullable(),
  valorCPExclusiva: z.number().min(0).optional().nullable(),
  engenheiroResponsavel: z.string().optional().nullable(),
  creaEngenheiro: z.string().optional().nullable(),
  artRrt: z.string().optional().nullable(),
  situacao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  // Novos campos
  cno: z.string().optional().nullable(),
  prazoExecucaoDias: z.number().int().min(0).optional().nullable(),
  dataTerminoExecucao: zLocalDate.nullable().optional(),
  convenioId: z.string()
});

const updateSchema = createSchema.omit({ convenioId: true }).partial();

export class ContratoController {
  private readonly repository = new PrismaContratoRepository();
  private readonly statusService = new ConvenioStatusService(new PrismaConvenioRepository());

  async index(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const useCase = new ListContratosUseCase(this.repository);
    const contratos = await useCase.execute(convenioId);
    return res.json(contratos);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetContratoUseCase(this.repository);
    const contrato = await useCase.execute(id);
    return res.json(contrato);
  }

  async create(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const payload = createSchema.parse({ ...req.body, convenioId });
    const useCase = new CreateContratoUseCase(this.repository);
    const contrato = await useCase.execute(payload);

    // Recalcula status do convênio (pode mudar APROVADO → EM_EXECUCAO)
    await this.statusService.recalculate(convenioId);

    return res.status(201).json(contrato);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateContratoUseCase(this.repository);
    const contrato = await useCase.execute(id, payload);
    return res.json(contrato);
  }

  async remove(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const id = req.params.id;
    const useCase = new DeleteContratoUseCase(this.repository);
    await useCase.execute(id);

    // Recalcula status do convênio (pode mudar EM_EXECUCAO → APROVADO)
    await this.statusService.recalculate(convenioId);

    return res.status(204).send();
  }
}
