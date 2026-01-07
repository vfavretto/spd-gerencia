import type { Request, Response } from 'express';
import { z } from 'zod';
import { 
  SecretariaModel, 
  OrgaoConcedenteModel, 
  ProgramaModel, 
  FonteRecursoModel 
} from '@spd/db';

// Transforma strings vazias em undefined para que o Mongoose as salve como null
const transformEmptyToUndefined = (val: string | undefined) => 
  val === '' ? undefined : val;

const baseSchema = z.object({
  nome: z.string().min(2),
  sigla: z.string().optional().transform(transformEmptyToUndefined),
  responsavel: z.string().optional().transform(transformEmptyToUndefined),
  descricao: z.string().optional().transform(transformEmptyToUndefined),
  codigo: z.string().optional().transform(transformEmptyToUndefined),
  tipo: z.string().optional().transform(transformEmptyToUndefined),
  contato: z.string().optional().transform(transformEmptyToUndefined),
  esfera: z.string().optional().transform(transformEmptyToUndefined)
});

export class ConfiguracoesController {
  async listarSecretarias(_req: Request, res: Response) {
    const dados = await SecretariaModel.find().sort({ nome: 1 });
    return res.json(dados);
  }

  async criarSecretaria(req: Request, res: Response) {
    const payload = baseSchema.pick({ nome: true, sigla: true, responsavel: true }).parse(req.body);
    const secretaria = await SecretariaModel.create(payload);
    return res.status(201).json(secretaria);
  }

  async atualizarSecretaria(req: Request, res: Response) {
    const id = req.params.id;
    const payload = baseSchema.pick({ nome: true, sigla: true, responsavel: true }).partial().parse(req.body);
    const secretaria = await SecretariaModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );
    return res.json(secretaria);
  }

  async removerSecretaria(req: Request, res: Response) {
    const id = req.params.id;
    await SecretariaModel.findByIdAndDelete(id);
    return res.status(204).send();
  }

  async listarOrgaos(_req: Request, res: Response) {
    const dados = await OrgaoConcedenteModel.find().sort({ nome: 1 });
    return res.json(dados);
  }

  async criarOrgao(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, esfera: true, contato: true });
    const payload = schema.parse(req.body);
    const orgao = await OrgaoConcedenteModel.create(payload);
    return res.status(201).json(orgao);
  }

  async atualizarOrgao(req: Request, res: Response) {
    const id = req.params.id;
    const schema = baseSchema.pick({ nome: true, esfera: true, contato: true }).partial();
    const payload = schema.parse(req.body);
    const orgao = await OrgaoConcedenteModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );
    return res.json(orgao);
  }

  async removerOrgao(req: Request, res: Response) {
    const id = req.params.id;
    await OrgaoConcedenteModel.findByIdAndDelete(id);
    return res.status(204).send();
  }

  async listarProgramas(_req: Request, res: Response) {
    const dados = await ProgramaModel.find().sort({ nome: 1 });
    return res.json(dados);
  }

  async criarPrograma(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, codigo: true, descricao: true });
    const payload = schema.parse(req.body);
    const programa = await ProgramaModel.create(payload);
    return res.status(201).json(programa);
  }

  async atualizarPrograma(req: Request, res: Response) {
    const id = req.params.id;
    const schema = baseSchema.pick({ nome: true, codigo: true, descricao: true }).partial();
    const payload = schema.parse(req.body);
    const programa = await ProgramaModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );
    return res.json(programa);
  }

  async removerPrograma(req: Request, res: Response) {
    const id = req.params.id;
    await ProgramaModel.findByIdAndDelete(id);
    return res.status(204).send();
  }

  async listarFontes(_req: Request, res: Response) {
    const dados = await FonteRecursoModel.find().sort({ nome: 1 });
    return res.json(dados);
  }

  async criarFonte(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, tipo: true });
    const payload = schema.parse(req.body);
    const fonte = await FonteRecursoModel.create(payload);
    return res.status(201).json(fonte);
  }

  async atualizarFonte(req: Request, res: Response) {
    const id = req.params.id;
    const schema = baseSchema.pick({ nome: true, tipo: true }).partial();
    const payload = schema.parse(req.body);
    const fonte = await FonteRecursoModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );
    return res.json(fonte);
  }

  async removerFonte(req: Request, res: Response) {
    const id = req.params.id;
    await FonteRecursoModel.findByIdAndDelete(id);
    return res.status(204).send();
  }
}
