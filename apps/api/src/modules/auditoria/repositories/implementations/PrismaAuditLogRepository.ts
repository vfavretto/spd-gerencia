import { type Prisma } from '@prisma/client';
import { prisma } from '@spd/db';
import type {
  IAuditLogRepository,
  CreateAuditLogDTO,
  AuditLogFilters,
  AuditLogResult
} from '../AuditLogRepository';

export class PrismaAuditLogRepository implements IAuditLogRepository {
  async create(data: CreateAuditLogDTO): Promise<AuditLogResult> {
    const auditLog = await prisma.auditLog.create({
      data: {
        usuarioId: data.usuarioId,
        usuarioNome: data.usuarioNome,
        usuarioEmail: data.usuarioEmail,
        acao: data.acao,
        entidade: data.entidade,
        entidadeId: data.entidadeId,
        dadosAntigos: data.dadosAntigos as Prisma.InputJsonValue,
        dadosNovos: data.dadosNovos as Prisma.InputJsonValue,
        ip: data.ip,
        userAgent: data.userAgent
      }
    });

    return {
      ...auditLog,
      dadosAntigos: auditLog.dadosAntigos as Record<string, unknown> | null,
      dadosNovos: auditLog.dadosNovos as Record<string, unknown> | null
    };
  }

  async findMany(
    filters: AuditLogFilters,
    page = 1,
    limit = 20
  ): Promise<{
    data: AuditLogResult[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters.entidade) {
      where.entidade = filters.entidade;
    }

    if (filters.entidadeId) {
      where.entidadeId = filters.entidadeId;
    }

    if (filters.acao) {
      where.acao = filters.acao;
    }

    if (filters.dataInicio || filters.dataFim) {
      where.criadoEm = {};
      if (filters.dataInicio) {
        where.criadoEm.gte = filters.dataInicio;
      }
      if (filters.dataFim) {
        where.criadoEm.lte = filters.dataFim;
      }
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      data: data.map(log => ({
        ...log,
        dadosAntigos: log.dadosAntigos as Record<string, unknown> | null,
        dadosNovos: log.dadosNovos as Record<string, unknown> | null
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: number): Promise<AuditLogResult | null> {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id }
    });

    if (!auditLog) return null;

    return {
      ...auditLog,
      dadosAntigos: auditLog.dadosAntigos as Record<string, unknown> | null,
      dadosNovos: auditLog.dadosNovos as Record<string, unknown> | null
    };
  }

  async findByEntidade(entidade: string, entidadeId: string): Promise<AuditLogResult[]> {
    const data = await prisma.auditLog.findMany({
      where: {
        entidade,
        entidadeId
      },
      orderBy: { criadoEm: 'desc' }
    });

    return data.map(log => ({
      ...log,
      dadosAntigos: log.dadosAntigos as Record<string, unknown> | null,
      dadosNovos: log.dadosNovos as Record<string, unknown> | null
    }));
  }
}
