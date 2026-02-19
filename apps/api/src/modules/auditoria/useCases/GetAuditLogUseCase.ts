import type { IAuditLogRepository } from '../repositories/AuditLogRepository';
import { AppError } from '@shared/errors/AppError';

export class GetAuditLogUseCase {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  async execute(id: number) {
    const auditLog = await this.auditLogRepository.findById(id);

    if (!auditLog) {
      throw new AppError('Registro de auditoria não encontrado', 404);
    }

    return auditLog;
  }
}
