import type { AcaoAuditoria } from '@prisma/client';
import { PrismaAuditLogRepository } from '../repositories/implementations/PrismaAuditLogRepository';
import { CreateAuditLogUseCase } from '../useCases/CreateAuditLogUseCase';

const auditLogRepository = new PrismaAuditLogRepository();
const createAuditLogUseCase = new CreateAuditLogUseCase(auditLogRepository);

export interface AuditUser {
  id: string;
  nome?: string;
  email?: string;
}

export interface AuditOptions {
  user: AuditUser;
  acao: AcaoAuditoria;
  entidade: string;
  entidadeId: string;
  dadosAntigos?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Serviço para registrar logs de auditoria.
 * Deve ser chamado após operações de CREATE, UPDATE ou DELETE.
 */
export class AuditService {
  /**
   * Registra uma ação no log de auditoria.
   * Este método não lança exceções para não interferir no fluxo principal.
   */
  static async log(options: AuditOptions): Promise<void> {
    try {
      await createAuditLogUseCase.execute({
        usuarioId: options.user.id,
        usuarioNome: options.user.nome ?? 'Desconhecido',
        usuarioEmail: options.user.email ?? 'desconhecido@email.com',
        acao: options.acao,
        entidade: options.entidade,
        entidadeId: options.entidadeId,
        dadosAntigos: options.dadosAntigos,
        dadosNovos: options.dadosNovos,
        ip: options.ip,
        userAgent: options.userAgent
      });
    } catch (error) {
      // Log silencioso para não interferir no fluxo principal
      console.error('[AuditService] Erro ao registrar log de auditoria:', error);
    }
  }

  /**
   * Atalho para registrar uma ação de criação.
   */
  static async logCreate(
    user: AuditUser,
    entidade: string,
    entidadeId: string,
    dadosNovos: Record<string, unknown>,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      user,
      acao: 'CREATE',
      entidade,
      entidadeId,
      dadosNovos,
      ip,
      userAgent
    });
  }

  /**
   * Atalho para registrar uma ação de atualização.
   */
  static async logUpdate(
    user: AuditUser,
    entidade: string,
    entidadeId: string,
    dadosAntigos: Record<string, unknown>,
    dadosNovos: Record<string, unknown>,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      user,
      acao: 'UPDATE',
      entidade,
      entidadeId,
      dadosAntigos,
      dadosNovos,
      ip,
      userAgent
    });
  }

  /**
   * Atalho para registrar uma ação de exclusão.
   */
  static async logDelete(
    user: AuditUser,
    entidade: string,
    entidadeId: string,
    dadosAntigos: Record<string, unknown>,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      user,
      acao: 'DELETE',
      entidade,
      entidadeId,
      dadosAntigos,
      ip,
      userAgent
    });
  }
}
