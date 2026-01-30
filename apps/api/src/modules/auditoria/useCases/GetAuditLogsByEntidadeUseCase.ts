import type { IAuditLogRepository } from '../repositories/AuditLogRepository';

export class GetAuditLogsByEntidadeUseCase {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  async execute(entidade: string, entidadeId: string) {
    return this.auditLogRepository.findByEntidade(entidade, entidadeId);
  }
}
