/**
 * Seed dos convênios a partir da planilha (scripts/data/seed-data.json),
 * incluindo entidades filhas: emenda parlamentar, conta financeira,
 * contrato de execução, pendências e aditivos.
 *
 * Executado por `npm run seed` após `seed_prisma.ts`.
 * Idempotente: convênios já existentes (mesmo `codigo`) são ignorados.
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

type Emenda = {
  nomeParlamentar: string;
  partido: string | null;
  codigoEmenda: string | null;
  funcao: string | null;
  subfuncao: string | null;
  programa: string | null;
  valorIndicado: number | null;
  anoEmenda: number | null;
};

type Financeiro = {
  contaBancaria: string | null;
  valorLiberadoTotal: number | null;
  dataDeposito: string | null;
  saldoRendimentos: number | null;
  codigoReceita: string | null;
};

type Contrato = {
  modalidadeLicitacao: string | null;
  numProcessoLicitatorio: string | null;
  numeroContrato: string | null;
  contratadaNome: string | null;
  dataAssinatura: string | null;
  dataVigenciaFim: string | null;
  dataOIS: string | null;
  dataTerminoExecucao: string | null;
  valorContrato: number | null;
  cno: string | null;
  engenheiroResponsavel: string | null;
};

type Pendencia = {
  descricao: string;
  orgaoResponsavel: string | null;
  status: string;
};

type Aditivo = {
  numeroAditivo: number;
  tipoAditivo: string;
  novaVigencia?: string;
  valorAcrescimo?: number;
  motivo: string;
};

type Convenio = {
  codigo: string;
  titulo: string;
  objeto: string;
  descricao: string | null;
  status: string;
  esfera: string | null;
  clausulaSuspensiva: boolean;
  numeroProposta: string | null;
  numeroTermo: string | null;
  ministerioOrgao: string | null;
  area: string | null;
  dataInicioProcesso: string | null;
  dataAssinatura: string | null;
  dataInicioVigencia: string | null;
  dataFimVigencia: string | null;
  processoSPD: string | null;
  processoCreditoAdicional: string | null;
  valorGlobal: number;
  valorRepasse: number | null;
  valorContrapartida: number | null;
  secretariaId: string;
  orgaoId: string | null;
  programaId: string | null;
  modalidadeRepasseId: string | null;
  tipoTermoFormalizacaoId: string | null;
  emenda: Emenda | null;
  financeiro: Financeiro | null;
  contrato: Contrato | null;
  pendencias: Pendencia[];
  aditivos: Aditivo[];
};

type SeedData = { convenios: Convenio[] };

function loadData(): SeedData {
  const raw = readFileSync(join(__dirname, 'data', 'seed-data.json'), 'utf-8');
  return JSON.parse(raw) as SeedData;
}

function date(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

async function seedConvenio(c: Convenio): Promise<boolean> {
  const existente = await prisma.convenio.findUnique({ where: { codigo: c.codigo } });
  if (existente) {
    return false;
  }

  await prisma.convenio.create({
    data: {
      codigo: c.codigo,
      titulo: c.titulo,
      objeto: c.objeto,
      descricao: c.descricao,
      status: c.status as never,
      esfera: (c.esfera as never) ?? null,
      clausulaSuspensiva: c.clausulaSuspensiva,
      numeroProposta: c.numeroProposta,
      numeroTermo: c.numeroTermo,
      ministerioOrgao: c.ministerioOrgao,
      area: c.area,
      dataInicioProcesso: date(c.dataInicioProcesso),
      dataAssinatura: date(c.dataAssinatura),
      dataInicioVigencia: date(c.dataInicioVigencia),
      dataFimVigencia: date(c.dataFimVigencia),
      processoSPD: c.processoSPD,
      processoCreditoAdicional: c.processoCreditoAdicional,
      valorGlobal: c.valorGlobal,
      valorRepasse: c.valorRepasse,
      valorContrapartida: c.valorContrapartida,
      secretariaId: c.secretariaId,
      orgaoId: c.orgaoId,
      programaId: c.programaId,
      modalidadeRepasseId: c.modalidadeRepasseId,
      tipoTermoFormalizacaoId: c.tipoTermoFormalizacaoId,
      emendas: c.emenda
        ? {
            create: [
              {
                nomeParlamentar: c.emenda.nomeParlamentar,
                partido: c.emenda.partido,
                codigoEmenda: c.emenda.codigoEmenda,
                funcao: c.emenda.funcao,
                subfuncao: c.emenda.subfuncao,
                programa: c.emenda.programa,
                valorIndicado: c.emenda.valorIndicado,
                anoEmenda: c.emenda.anoEmenda,
              },
            ],
          }
        : undefined,
      financeiroContas: c.financeiro
        ? {
            create: {
              contaBancaria: c.financeiro.contaBancaria,
              valorLiberadoTotal: c.financeiro.valorLiberadoTotal,
              dataDeposito: date(c.financeiro.dataDeposito),
              saldoRendimentos: c.financeiro.saldoRendimentos,
              codigoReceita: c.financeiro.codigoReceita,
            },
          }
        : undefined,
      contratos: c.contrato
        ? {
            create: [
              {
                modalidadeLicitacao: (c.contrato.modalidadeLicitacao as never) ?? null,
                numProcessoLicitatorio: c.contrato.numProcessoLicitatorio,
                numeroContrato: c.contrato.numeroContrato,
                contratadaNome: c.contrato.contratadaNome,
                dataAssinatura: date(c.contrato.dataAssinatura),
                dataVigenciaFim: date(c.contrato.dataVigenciaFim),
                dataOIS: date(c.contrato.dataOIS),
                dataTerminoExecucao: date(c.contrato.dataTerminoExecucao),
                valorContrato: c.contrato.valorContrato,
                cno: c.contrato.cno,
                engenheiroResponsavel: c.contrato.engenheiroResponsavel,
              },
            ],
          }
        : undefined,
      pendencias:
        c.pendencias.length > 0
          ? {
              create: c.pendencias.map((p) => ({
                descricao: p.descricao,
                orgaoResponsavel: p.orgaoResponsavel,
                status: p.status as never,
              })),
            }
          : undefined,
      aditivos:
        c.aditivos.length > 0
          ? {
              create: c.aditivos.map((a) => ({
                numeroAditivo: a.numeroAditivo,
                tipoAditivo: a.tipoAditivo as never,
                novaVigencia: date(a.novaVigencia),
                valorAcrescimo: a.valorAcrescimo ?? null,
                motivo: a.motivo,
              })),
            }
          : undefined,
    },
  });
  return true;
}

async function main() {
  console.log('Seed de convênios:');
  const { convenios } = loadData();

  let criados = 0;
  let ignorados = 0;
  for (const c of convenios) {
    const novo = await seedConvenio(c);
    if (novo) {
      criados += 1;
    } else {
      ignorados += 1;
    }
  }

  console.log(`  ${criados} convênios criados, ${ignorados} já existentes`);
  console.log('Convênios concluídos.');
}

main()
  .catch((err) => {
    console.error('Falha no seed de convênios:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
