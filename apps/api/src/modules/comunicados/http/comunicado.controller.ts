import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaComunicadoRepository } from '../repositories/implementations/PrismaComunicadoRepository';
import { ListComunicadosUseCase } from '../useCases/ListComunicadosUseCase';
import { GetComunicadoUseCase } from '../useCases/GetComunicadoUseCase';
import { CreateComunicadoUseCase } from '../useCases/CreateComunicadoUseCase';
import { UpdateComunicadoUseCase } from '../useCases/UpdateComunicadoUseCase';
import { DeleteComunicadoUseCase } from '../useCases/DeleteComunicadoUseCase';
import { AuditService } from '../../auditoria/services/AuditService';

const createSchema = z.object({
  protocolo: z.string(),
  assunto: z.string().min(3),
  conteudo: z.string().nullable().optional(),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  dataRegistro: z.coerce.date().optional(),
  origem: z.string().nullable().optional(),
  destino: z.string().nullable().optional(),
  responsavel: z.string().nullable().optional(),
  arquivoUrl: z.string().url().nullable().optional().or(z.literal('')).transform(val => val === '' ? null : val)
});

const updateSchema = createSchema.partial();

export class ComunicadoController {
  private readonly repository = new PrismaComunicadoRepository();

  async index(req: Request, res: Response) {
    const tipo = req.query.tipo?.toString() as 'ENTRADA' | 'SAIDA' | undefined;
    const search = req.query.search?.toString();
    const responsavel = req.query.responsavel?.toString();
    const dataInicio = req.query.dataInicio?.toString();
    const dataFim = req.query.dataFim?.toString();

    const useCase = new ListComunicadosUseCase(this.repository);
    const comunicados = await useCase.execute({
      tipo, search, responsavel, dataInicio, dataFim
    });
    return res.json(comunicados);
  }

  async show(req: Request, res: Response) {
    const id = req.params.id;
    const useCase = new GetComunicadoUseCase(this.repository);
    const comunicado = await useCase.execute(id);
    return res.json(comunicado);
  }

  async create(req: Request, res: Response) {
    const payload = createSchema.parse(req.body);
    const useCase = new CreateComunicadoUseCase(this.repository);
    const comunicado = await useCase.execute(payload);

    // Registra auditoria
    await AuditService.logCreate(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Comunicado',
      comunicado.id,
      comunicado as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.status(201).json(comunicado);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload = updateSchema.parse(req.body);

    // Busca dados antigos para auditoria
    const getUseCase = new GetComunicadoUseCase(this.repository);
    const dadosAntigos = await getUseCase.execute(id);

    const useCase = new UpdateComunicadoUseCase(this.repository);
    const comunicado = await useCase.execute(id, payload);

    // Registra auditoria
    await AuditService.logUpdate(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Comunicado',
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      comunicado as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.json(comunicado);
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id;

    // Busca dados para auditoria antes de excluir
    const getUseCase = new GetComunicadoUseCase(this.repository);
    const dadosAntigos = await getUseCase.execute(id);

    const useCase = new DeleteComunicadoUseCase(this.repository);
    await useCase.execute(id);

    // Registra auditoria
    await AuditService.logDelete(
      { id: req.user!.id, nome: req.user!.nome, email: req.user!.email },
      'Comunicado',
      id,
      dadosAntigos as unknown as Record<string, unknown>,
      req.ip,
      req.get('user-agent')
    );

    return res.status(204).send();
  }
}
