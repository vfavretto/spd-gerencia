import path from 'node:path';
import dotenv from 'dotenv';
import { ConvenioStatus } from '@prisma/client';
import { prisma } from '../src/connection';
import { conveniosData } from './seed_data/convenios';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Converte a string de situação da planilha
 * para o enum ConvenioStatus do Prisma.
 */
function getStatusByString(statusStr: string | null): ConvenioStatus {
  if (!statusStr) return ConvenioStatus.RASCUNHO;

  const s = statusStr.toUpperCase();

  if (s.includes('ANÁLISE') || s.includes('ANALISE') || s.includes('DILIGÊNCIA') || s.includes('DILIGENCIA')) {
    return ConvenioStatus.EM_ANALISE;
  }
  if (s.includes('FINALIZADA') || s.includes('CONCLUÍDO') || s.includes('CONCLUIDO')) {
    return ConvenioStatus.CONCLUIDO;
  }
  if (s.includes('CANCELAD')) {
    return ConvenioStatus.CANCELADO;
  }
  if (s.includes('EXECUÇÃO') || s.includes('EXECUCAO')) {
    return ConvenioStatus.EM_EXECUCAO;
  }

  return ConvenioStatus.EM_EXECUCAO;
}

/**
 * Converte um serial numérico do Excel (dias desde 30/12/1899)
 * ou uma string de data em um objeto Date.
 */
function parseExcelDate(serial: unknown): Date | null {
  if (serial === null || serial === undefined) return null;

  if (typeof serial === 'string') {
    const d = new Date(serial);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof serial === 'number') {
    const utcDays  = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    return new Date(
      dateInfo.getFullYear(),
      dateInfo.getMonth(),
      dateInfo.getDate(),
    );
  }

  return null;
}

/**
 * Converte um valor desconhecido (string ou number) em number.
 */
function parseNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Busca ou cria uma Secretaria pelo nome.
 */
async function findOrCreateSecretaria(nome: string) {
  const existing = await prisma.secretaria.findFirst({ where: { nome } });
  if (existing) return existing;
  return prisma.secretaria.create({
    data: { nome, sigla: nome.substring(0, 5).toUpperCase() },
  });
}

/**
 * Busca ou cria um OrgaoConcedente pelo nome.
 */
async function findOrCreateOrgao(nome: string) {
  const existing = await prisma.orgaoConcedente.findFirst({ where: { nome } });
  if (existing) return existing;
  return prisma.orgaoConcedente.create({ data: { nome } });
}

/**
 * Extrai uma string segura de uma propriedade da planilha.
 */
function getString(row: Record<string, unknown>, key: string, fallback = ''): string {
  const val = row[key];
  if (val === null || val === undefined) return fallback;
  return String(val).trim() || fallback;
}

/**
 * Função principal de seed: itera sobre os dados extraídos
 * do Excel e insere/atualiza Convênios, Secretarias e Órgãos.
 */
export async function seedConvenios(): Promise<void> {
  console.log(`🌱 Iniciando o seed de ${conveniosData.length} convênios...`);

  for (const row of conveniosData as Record<string, unknown>[]) {
    const propDemanda = getString(row, 'Proposta/ Demanda');
    const numTermo = getString(row, 'Número do Termo');
    const codigoConvenio = propDemanda || numTermo;

    if (!codigoConvenio) {
      console.log('⏭️  Pulando linha sem código de convênio...');
      continue;
    }

    const secretariaNome = getString(row, 'Área', 'Desconhecida');
    const orgaoNome = getString(row, 'Ministério', 'Desconhecido');

    const secretaria = await findOrCreateSecretaria(secretariaNome);
    const orgao = await findOrCreateOrgao(orgaoNome);

    const statusVal = getStatusByString(getString(row, 'Situação') || null);
    const objeto = getString(row, 'Objeto', 'Sem objeto').substring(0, 190);
    const repasse = parseNumber(row['Repasse']);
    const contrapartida = parseNumber(row['Contrapartida']);

    const convenioPayload = {
      titulo: objeto,
      objeto: objeto,
      status: statusVal,
      secretariaId: secretaria.id,
      orgaoId: orgao.id,
      valorGlobal: repasse + contrapartida,
      valorRepasse: repasse,
      valorContrapartida: contrapartida,
      dataAssinatura: parseExcelDate(row['Data de Assinatura']),
      dataFimVigencia: parseExcelDate(row['Vigência']),
      processoSPD: getString(row, 'Processo SPD') || null,
      area: getString(row, 'Área') || null,
    };

    await prisma.convenio.upsert({
      where: { codigo: codigoConvenio },
      update: convenioPayload,
      create: {
        codigo: codigoConvenio,
        ...convenioPayload,
      },
    });

    console.log(`  ✔ Convênio ${codigoConvenio} processado`);
  }

  console.log('✅ Seed de convênios finalizado com sucesso!');
}

if (require.main === module) {
  seedConvenios()
    .catch((e: unknown) => {
      console.error('❌ Erro no seed de convênios:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
