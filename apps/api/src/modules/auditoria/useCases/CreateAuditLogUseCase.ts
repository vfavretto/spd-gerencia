import type { AcaoAuditoria } from '@prisma/client';
import type { IAuditLogRepository, CreateAuditLogDTO } from '../repositories/AuditLogRepository';

interface CreateAuditLogInput {
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  acao: AcaoAuditoria;
  entidade: string;
  entidadeId: string;
  dadosAntigos?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export class CreateAuditLogUseCase {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  async execute(input: CreateAuditLogInput) {
    const data: CreateAuditLogDTO = {
      usuarioId: input.usuarioId,
      usuarioNome: input.usuarioNome,
      usuarioEmail: input.usuarioEmail,
      acao: input.acao,
      entidade: input.entidade,
      entidadeId: input.entidadeId,
      dadosAntigos: input.dadosAntigos,
      dadosNovos: input.dadosNovos,
      ip: input.ip,
      userAgent: input.userAgent
    };

    return this.auditLogRepository.create(data);
  }
}
