import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@spd/db';

// Transforma strings vazias em undefined para que o Prisma as salve como null
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
    const dados = await prisma.secretaria.findMany({
      orderBy: { nome: 'asc' }
    });
    return res.json(dados);
  }

  async criarSecretaria(req: Request, res: Response) {
    const payload = baseSchema.pick({ nome: true, sigla: true, responsavel: true }).parse(req.body);
    const secretaria = await prisma.secretaria.create({ data: payload });
    return res.status(201).json(secretaria);
  }

  async atualizarSecretaria(req: Request, res: Response) {
    const id = Number(req.params.id);
    const payload = baseSchema.pick({ nome: true, sigla: true, responsavel: true }).partial().parse(req.body);
    const secretaria = await prisma.secretaria.update({
      where: { id },
      data: payload
    });
    return res.json(secretaria);
  }

  async removerSecretaria(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.secretaria.delete({ where: { id } });
    return res.status(204).send();
  }

  async listarOrgaos(_req: Request, res: Response) {
    const dados = await prisma.orgaoConcedente.findMany({ orderBy: { nome: 'asc' } });
    return res.json(dados);
  }

  async criarOrgao(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, esfera: true, contato: true });
    const payload = schema.parse(req.body);
    const orgao = await prisma.orgaoConcedente.create({ data: payload });
    return res.status(201).json(orgao);
  }

  async atualizarOrgao(req: Request, res: Response) {
    const id = Number(req.params.id);
    const schema = baseSchema.pick({ nome: true, esfera: true, contato: true }).partial();
    const payload = schema.parse(req.body);
    const orgao = await prisma.orgaoConcedente.update({ where: { id }, data: payload });
    return res.json(orgao);
  }

  async removerOrgao(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.orgaoConcedente.delete({ where: { id } });
    return res.status(204).send();
  }

  async listarProgramas(_req: Request, res: Response) {
    const dados = await prisma.programa.findMany({ orderBy: { nome: 'asc' } });
    return res.json(dados);
  }

  async criarPrograma(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, codigo: true, descricao: true });
    const payload = schema.parse(req.body);
    const programa = await prisma.programa.create({ data: payload });
    return res.status(201).json(programa);
  }

  async atualizarPrograma(req: Request, res: Response) {
    const id = Number(req.params.id);
    const schema = baseSchema.pick({ nome: true, codigo: true, descricao: true }).partial();
    const payload = schema.parse(req.body);
    const programa = await prisma.programa.update({ where: { id }, data: payload });
    return res.json(programa);
  }

  async removerPrograma(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.programa.delete({ where: { id } });
    return res.status(204).send();
  }

  async listarFontes(_req: Request, res: Response) {
    const dados = await prisma.fonteRecurso.findMany({ orderBy: { nome: 'asc' } });
    return res.json(dados);
  }

  async criarFonte(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, tipo: true });
    const payload = schema.parse(req.body);
    const fonte = await prisma.fonteRecurso.create({ data: payload });
    return res.status(201).json(fonte);
  }

  async atualizarFonte(req: Request, res: Response) {
    const id = Number(req.params.id);
    const schema = baseSchema.pick({ nome: true, tipo: true }).partial();
    const payload = schema.parse(req.body);
    const fonte = await prisma.fonteRecurso.update({ where: { id }, data: payload });
    return res.json(fonte);
  }

  async removerFonte(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.fonteRecurso.delete({ where: { id } });
    return res.status(204).send();
  }
}
