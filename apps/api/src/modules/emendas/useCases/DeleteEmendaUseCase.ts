import type { EmendaRepository } from '../repositories/EmendaRepository';

export class DeleteEmendaUseCase {
  constructor(private readonly repository: EmendaRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
