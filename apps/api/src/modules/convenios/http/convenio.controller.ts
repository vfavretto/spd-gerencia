import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaConvenioRepository } from '../repositories/implementations/PrismaConvenioRepository';
import { ListConveniosLiteUseCase } from '../useCases/ListConveniosLiteUseCase';
import { GetConvenioUseCase } from '../useCases/GetConvenioUseCase';
import { CreateConvenioUseCase } from '../useCases/CreateConvenioUseCase';
import { UpdateConvenioUseCase } from '../useCases/UpdateConvenioUseCase';
import { DeleteConvenioUseCase } from '../useCases/DeleteConvenioUseCase';
import { ConcluirConvenioUseCase } from '../useCases/ConcluirConvenioUseCase';
import { CancelarConvenioUseCase } from '../useCases/CancelarConvenioUseCase';
import { GetValoresVigentesUseCase } from '../useCases/GetValoresVigentesUseCase';
import { AuditService } from '../../auditoria/services/AuditService';
import { SnapshotService } from '../../snapshots/services/SnapshotService';

const parseDate = z.preprocess((arg) => {
  if (arg === '' || arg === null || arg === undefined) return null;
  return new Date(arg as string | number | Date);
}, z.date().nullable().optional());

const commonSchema = {
  codigo: z.string().min(1),
  titulo: z.string().min(1),
  objeto: z.string().min(1),
  descricao: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  valorGlobal: z.number().min(0).optional(),
  valorRepasse: z.number().min(0).nullable().optional(),
  valorContrapartida: z.number().min(0).nullable().optional(),
  dataAssinatura: parseDate,
  dataInicioVigencia: parseDate,
  dataFimVigencia: parseDate,
  dataPrestacaoContas: parseDate,
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
  numeroProposta: z.string().nullable().optional(),
  numeroTermo: z.string().nullable().optional(),
  esfera: z.enum(['FEDERAL', 'ESTADUAL']).nullable().optional(),
  modalidadeRepasseId: z.string().nullable().optional(),
  processoSPD: z.string().nullable().optional(),
  processoCreditoAdicional: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  secretariaId: z.string(),
  orgaoId: z.string().nullable().optional(),
  programaId: z.string().nullable().optional()
};

const createSchema = z.object(commonSchema);
const updateSchema = createSchema.partial();

export class ConvenioController {
  private readonly repository = new PrismaConvenioRepository();

  async index(req: Request, res: Response) {
    const search = req.query.search?.toString();
    const status = req.query.status?.toString();
    const secretariaId = req.query.secretariaId?.toString();
    const esfera = req.query.esfera?.toString();
    const modalidadeRepasseId = req.query.modalidadeRepasseId?.toString();
    const dataInicioVigencia = req.query.dataInicioVigencia?.toString();
    const dataFimVigencia = req.query.dataFimVigencia?.toString();
    const valorMin = req.query.valorMin ? Number(req.query.valorMin) : undefined;
    const valorMax = req.query.valorMax ? Number(req.query.valorMax) : undefined;

    // Usa listLite para performance na listagem
    const useCase = new ListConveniosLiteUseCase(this.repository);
    const convenios = await useCase.execute({
      search, status, secretariaId, esfera, modalidadeRepasseId,
      dataInicioVigencia, dataFimVigencia, valorMin, valorMax
    });
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
    // Auto-calcular valorGlobal = valorRepasse + valorContrapartida
    payload.valorGlobal = (payload.valorRepasse ?? 0) + (payload.valorContrapartida ?? 0);
    const useCase = new CreateConvenioUseCase(this.repository);
    const convenio = await useCase.execute(payload as Required<Pick<typeof payload, 'valorGlobal'>> & typeof payload);

    // Registra auditoria
    await AuditService.logCreate(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Convenio',
      convenio.id,
      convenio as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.status(201).json(convenio);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    // Auto-calcular valorGlobal se repasse ou contrapartida foram enviados
    if (payload.valorRepasse !== undefined || payload.valorContrapartida !== undefined) {
      payload.valorGlobal = (payload.valorRepasse ?? 0) + (payload.valorContrapartida ?? 0);
    }

    // Busca dados antigos para auditoria e snapshot
    const getUseCase = new GetConvenioUseCase(this.repository);
    const dadosAntigos = await getUseCase.execute(id);

    // Cria snapshot antes da atualização (histórico de versões)
    await SnapshotService.beforeUpdate(
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      { id: req.user!.id }
    );

    const useCase = new UpdateConvenioUseCase(this.repository);
    const convenio = await useCase.execute(id, payload);

    // Registra auditoria
    await AuditService.logUpdate(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Convenio',
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      convenio as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.json(convenio);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;

    // Busca dados para auditoria antes de excluir
    const getUseCase = new GetConvenioUseCase(this.repository);
    const dadosAntigos = await getUseCase.execute(id);

    const useCase = new DeleteConvenioUseCase(this.repository);
    await useCase.execute(id);

    // Registra auditoria
    await AuditService.logDelete(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Convenio',
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.status(204).send();
  }

  async valoresVigentes(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetValoresVigentesUseCase(this.repository);
    const valores = await useCase.execute(id);
    return res.json(valores);
  }

  async concluir(req: Request, res: Response) {
    const id = req.params.id;

    // Busca dados antigos para auditoria e snapshot
    const getUseCase = new GetConvenioUseCase(this.repository);
    const dadosAntigos = await getUseCase.execute(id);

    await SnapshotService.beforeUpdate(
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      { id: req.user!.id }
    );

    const useCase = new ConcluirConvenioUseCase(this.repository);
    const convenio = await useCase.execute(id);

    await AuditService.logUpdate(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Convenio',
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      convenio as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.json(convenio);
  }

  async cancelar(req: Request, res: Response) {
    const id = req.params.id;

    // Busca dados antigos para auditoria e snapshot
    const getUseCase = new GetConvenioUseCase(this.repository);
    const dadosAntigos = await getUseCase.execute(id);

    await SnapshotService.beforeUpdate(
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      { id: req.user!.id }
    );

    const useCase = new CancelarConvenioUseCase(this.repository);
    const convenio = await useCase.execute(id);

    await AuditService.logUpdate(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Convenio',
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      convenio as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.json(convenio);
  }
}
