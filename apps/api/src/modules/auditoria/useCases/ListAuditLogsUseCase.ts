import type { AcaoAuditoria } from '@prisma/client';
import type { IAuditLogRepository, AuditLogFilters } from '../repositories/AuditLogRepository';

interface ListAuditLogsInput {
  usuarioId?: string;
  entidade?: string;
  entidadeId?: string;
  acao?: AcaoAuditoria;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export class ListAuditLogsUseCase {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  async execute(input: ListAuditLogsInput) {
    const filters: AuditLogFilters = {
      usuarioId: input.usuarioId,
      entidade: input.entidade,
      entidadeId: input.entidadeId,
      acao: input.acao,
      dataInicio: input.dataInicio ? new Date(input.dataInicio) : undefined,
      dataFim: input.dataFim ? new Date(input.dataFim) : undefined
    };

    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    return this.auditLogRepository.findMany(filters, page, limit);
  }
}
