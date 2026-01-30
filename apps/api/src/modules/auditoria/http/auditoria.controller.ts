import type { Request, Response } from 'express';
import { PrismaAuditLogRepository } from '../repositories/implementations/PrismaAuditLogRepository';
import { ListAuditLogsUseCase } from '../useCases/ListAuditLogsUseCase';
import { GetAuditLogUseCase } from '../useCases/GetAuditLogUseCase';
import { GetAuditLogsByEntidadeUseCase } from '../useCases/GetAuditLogsByEntidadeUseCase';
import type { AcaoAuditoria } from '@prisma/client';

const auditLogRepository = new PrismaAuditLogRepository();

export class AuditoriaController {
  async index(req: Request, res: Response) {
    const {
      usuarioId,
      entidade,
      entidadeId,
      acao,
      dataInicio,
      dataFim,
      page,
      limit
    } = req.query;

    const listAuditLogs = new ListAuditLogsUseCase(auditLogRepository);

    const result = await listAuditLogs.execute({
      usuarioId: usuarioId as string | undefined,
      entidade: entidade as string | undefined,
      entidadeId: entidadeId as string | undefined,
      acao: acao as AcaoAuditoria | undefined,
      dataInicio: dataInicio as string | undefined,
      dataFim: dataFim as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });

    return res.json(result);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const getAuditLog = new GetAuditLogUseCase(auditLogRepository);
    const auditLog = await getAuditLog.execute(id);

    return res.json(auditLog);
  }

  async byEntidade(req: Request, res: Response) {
    const { entidade, entidadeId } = req.params;

    const getByEntidade = new GetAuditLogsByEntidadeUseCase(auditLogRepository);
    const logs = await getByEntidade.execute(entidade, entidadeId);

    return res.json(logs);
  }
}
