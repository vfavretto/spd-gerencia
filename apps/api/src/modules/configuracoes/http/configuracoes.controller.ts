import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@spd/db';

// Transforma strings vazias em undefined para evitar salvar vazio
const transformEmptyToUndefined = (val: string | undefined) => 
  val === '' ? undefined : val;

const baseSchema = z.object({
  nome: z.string().min(2),
  sigla: z.string().optional().transform(transformEmptyToUndefined),
  responsavel: z.string().optional().transform(transformEmptyToUndefined),
  descricao: z.string().optional().transform(transformEmptyToUndefined),
  codigo: z.string().optional().transform(transformEmptyToUndefined),
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
    const id = req.params.id;
    const payload = baseSchema.pick({ nome: true, sigla: true, responsavel: true }).partial().parse(req.body);
    const secretaria = await prisma.secretaria.update({
      where: { id },
      data: payload
    });
    return res.json(secretaria);
  }

  async removerSecretaria(req: Request, res: Response) {
    const id = req.params.id;
    await prisma.secretaria.delete({ where: { id } });
    return res.status(204).send();
  }

  async listarOrgaos(_req: Request, res: Response) {
    const dados = await prisma.orgaoConcedente.findMany({
      orderBy: { nome: 'asc' }
    });
    return res.json(dados);
  }

  async criarOrgao(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, esfera: true, contato: true });
    const payload = schema.parse(req.body);
    const orgao = await prisma.orgaoConcedente.create({ data: payload });
    return res.status(201).json(orgao);
  }

  async atualizarOrgao(req: Request, res: Response) {
    const id = req.params.id;
    const schema = baseSchema.pick({ nome: true, esfera: true, contato: true }).partial();
    const payload = schema.parse(req.body);
    const orgao = await prisma.orgaoConcedente.update({
      where: { id },
      data: payload
    });
    return res.json(orgao);
  }

  async removerOrgao(req: Request, res: Response) {
    const id = req.params.id;
    await prisma.orgaoConcedente.delete({ where: { id } });
    return res.status(204).send();
  }

  async listarProgramas(_req: Request, res: Response) {
    const dados = await prisma.programa.findMany({
      orderBy: { nome: 'asc' }
    });
    return res.json(dados);
  }

  async criarPrograma(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true, codigo: true, descricao: true });
    const payload = schema.parse(req.body);
    const programa = await prisma.programa.create({ data: payload });
    return res.status(201).json(programa);
  }

  async atualizarPrograma(req: Request, res: Response) {
    const id = req.params.id;
    const schema = baseSchema.pick({ nome: true, codigo: true, descricao: true }).partial();
    const payload = schema.parse(req.body);
    const programa = await prisma.programa.update({
      where: { id },
      data: payload
    });
    return res.json(programa);
  }

  async removerPrograma(req: Request, res: Response) {
    const id = req.params.id;
    await prisma.programa.delete({ where: { id } });
    return res.status(204).send();
  }

  async listarModalidadesRepasse(_req: Request, res: Response) {
    const dados = await prisma.modalidadeRepasseCatalogo.findMany({
      orderBy: { nome: 'asc' }
    });
    return res.json(dados);
  }

  async criarModalidadeRepasse(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true });
    const payload = schema.parse(req.body);
    const modalidade = await prisma.modalidadeRepasseCatalogo.create({ data: payload });
    return res.status(201).json(modalidade);
  }

  async atualizarModalidadeRepasse(req: Request, res: Response) {
    const id = req.params.id;
    const schema = baseSchema.pick({ nome: true }).partial();
    const payload = schema.parse(req.body);
    const modalidade = await prisma.modalidadeRepasseCatalogo.update({
      where: { id },
      data: payload
    });
    return res.json(modalidade);
  }

  async removerModalidadeRepasse(req: Request, res: Response) {
    const id = req.params.id;
    await prisma.modalidadeRepasseCatalogo.delete({ where: { id } });
    return res.status(204).send();
  }

  // Tipos de Termo de Formalização
  async listarTiposTermoFormalizacao(_req: Request, res: Response) {
    const dados = await prisma.tipoTermoFormalizacaoCatalogo.findMany({
      orderBy: { nome: 'asc' }
    });
    return res.json(dados);
  }

  async criarTipoTermoFormalizacao(req: Request, res: Response) {
    const schema = baseSchema.pick({ nome: true });
    const payload = schema.parse(req.body);
    const tipo = await prisma.tipoTermoFormalizacaoCatalogo.create({ data: payload });
    return res.status(201).json(tipo);
  }

  async atualizarTipoTermoFormalizacao(req: Request, res: Response) {
    const id = req.params.id;
    const schema = baseSchema.pick({ nome: true }).partial();
    const payload = schema.parse(req.body);
    const tipo = await prisma.tipoTermoFormalizacaoCatalogo.update({
      where: { id },
      data: payload
    });
    return res.json(tipo);
  }

  async removerTipoTermoFormalizacao(req: Request, res: Response) {
    const id = req.params.id;
    await prisma.tipoTermoFormalizacaoCatalogo.delete({ where: { id } });
    return res.status(204).send();
  }
}
