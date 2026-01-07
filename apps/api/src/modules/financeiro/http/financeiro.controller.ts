import type { Request, Response } from 'express';
import { z } from 'zod';
import { MongooseFinanceiroRepository } from '../repositories/implementations/MongooseFinanceiroRepository';
import { GetFinanceiroUseCase } from '../useCases/GetFinanceiroUseCase';
import { UpsertFinanceiroUseCase } from '../useCases/UpsertFinanceiroUseCase';
import { DeleteFinanceiroUseCase } from '../useCases/DeleteFinanceiroUseCase';

const upsertSchema = z.object({
  banco: z.string().optional(),
  agencia: z.string().optional(),
  contaBancaria: z.string().optional(),
  valorLiberadoTotal: z.number().min(0).optional(),
  saldoRendimentos: z.number().min(0).optional(),
  fichasOrcamentarias: z.string().optional(),
  observacoes: z.string().optional()
});

export class FinanceiroController {
  private readonly repository = new MongooseFinanceiroRepository();

  async show(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const useCase = new GetFinanceiroUseCase(this.repository);
    const financeiro = await useCase.execute(convenioId);
    return res.json(financeiro);
  }

  async upsert(req: Request, res: Response) {
    const convenioId = req.params.convenioId;
    const payload = upsertSchema.parse(req.body);
    const useCase = new UpsertFinanceiroUseCase(this.repository);
    const financeiro = await useCase.execute(convenioId, payload);
    return res.json(financeiro);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new DeleteFinanceiroUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }
}
