import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaMedicaoRepository } from '../repositories/implementations/PrismaMedicaoRepository';
import { ListMedicoesUseCase } from '../useCases/ListMedicoesUseCase';
import { GetMedicaoUseCase } from '../useCases/GetMedicaoUseCase';
import { CreateMedicaoUseCase } from '../useCases/CreateMedicaoUseCase';
import { UpdateMedicaoUseCase } from '../useCases/UpdateMedicaoUseCase';
import { DeleteMedicaoUseCase } from '../useCases/DeleteMedicaoUseCase';
import { GetSaldoContratoUseCase } from '../useCases/GetSaldoContratoUseCase';

const createSchema = z.object({
  numeroMedicao: z.number().int().min(0).optional(),
  dataMedicao: z.coerce.date(),
  percentualFisico: z.number().min(0).max(100).optional().nullable(),
  valorMedido: z.number().min(0),
  dataPagamento: z.coerce.date().nullable().optional(),
  valorPago: z.number().min(0).optional().nullable(),
  observacoes: z.string().optional().nullable(),
  situacao: z.string().optional().nullable(),
  processoMedicao: z.string().optional().nullable(),
  contratoId: z.string()
});

const updateSchema = createSchema.omit({ contratoId: true, numeroMedicao: true }).partial();

export class MedicaoController {
  private readonly repository = new PrismaMedicaoRepository();

  async index(req: Request, res: Response) {
    const contratoId = req.params.contratoId;
    const useCase = new ListMedicoesUseCase(this.repository);
    const medicoes = await useCase.execute(contratoId);
    return res.json(medicoes);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetMedicaoUseCase(this.repository);
    const medicao = await useCase.execute(id);
    return res.json(medicao);
  }

  async create(req: Request, res: Response) {
    const contratoId = req.params.contratoId;
    const payload = createSchema.parse({ ...req.body, contratoId });
    const useCase = new CreateMedicaoUseCase(this.repository);
    const medicao = await useCase.execute({
      ...payload,
      numeroMedicao: payload.numeroMedicao ?? 0
    });
    return res.status(201).json(medicao);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);
    const useCase = new UpdateMedicaoUseCase(this.repository);
    const medicao = await useCase.execute(id, payload);
    return res.json(medicao);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new DeleteMedicaoUseCase(this.repository);
    await useCase.execute(id);
    return res.status(204).send();
  }

  async saldo(req: Request, res: Response) {
    const contratoId = req.params.contratoId;
    const useCase = new GetSaldoContratoUseCase(this.repository);
    const saldo = await useCase.execute(contratoId);
    return res.json(saldo);
  }
}
