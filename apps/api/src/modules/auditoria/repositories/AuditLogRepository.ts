import type { AcaoAuditoria } from '@prisma/client';

export interface CreateAuditLogDTO {
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

export interface AuditLogFilters {
  usuarioId?: string;
  entidade?: string;
  entidadeId?: string;
  acao?: AcaoAuditoria;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface AuditLogResult {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  acao: AcaoAuditoria;
  entidade: string;
  entidadeId: string;
  dadosAntigos: Record<string, unknown> | null;
  dadosNovos: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  criadoEm: Date;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogDTO): Promise<AuditLogResult>;
  findMany(filters: AuditLogFilters, page?: number, limit?: number): Promise<{
    data: AuditLogResult[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  findById(id: string): Promise<AuditLogResult | null>;
  findByEntidade(entidade: string, entidadeId: string): Promise<AuditLogResult[]>;
}
