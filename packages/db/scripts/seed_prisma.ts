/**
 * Seed de configuração: usuário administrador + cadastros base
 * (secretarias, órgãos concedentes, programas, modalidades de repasse e
 * tipos de termo de formalização).
 *
 * Executado por `npm run seed` antes de `seed_convenios.ts`.
 * Idempotente: pode ser rodado múltiplas vezes sem duplicar registros.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

type Secretaria = { id: string; sigla: string; nome: string; responsavel: string };
type Orgao = { id: string; nome: string; esfera: string | null };
type Programa = { id: string; nome: string; descricao: string | null };
type Catalogo = { id: string; nome: string };

type SeedData = {
  secretarias: Secretaria[];
  orgaos: Orgao[];
  programas: Programa[];
  modalidadesRepasse: Catalogo[];
  tiposTermoFormalizacao: Catalogo[];
};

const ADMIN = {
  nome: 'Administrador',
  email: 'admin@spd.votorantim.sp.gov.br',
  matricula: 'admin',
  senha: 'admin123',
};

function loadData(): SeedData {
  const raw = readFileSync(join(__dirname, 'data', 'seed-data.json'), 'utf-8');
  return JSON.parse(raw) as SeedData;
}

async function seedAdmin() {
  const senhaHash = await bcrypt.hash(ADMIN.senha, 10);
  await prisma.usuario.upsert({
    where: { email: ADMIN.email },
    update: { nome: ADMIN.nome, role: 'ADMIN', ativo: true },
    create: {
      nome: ADMIN.nome,
      email: ADMIN.email,
      matricula: ADMIN.matricula,
      senha: senhaHash,
      role: 'ADMIN',
      ativo: true,
    },
  });
  console.log(`  usuário admin pronto (matrícula: ${ADMIN.matricula})`);
}

async function seedSecretarias(secretarias: Secretaria[]) {
  for (const s of secretarias) {
    await prisma.secretaria.upsert({
      where: { id: s.id },
      update: { nome: s.nome, sigla: s.sigla, responsavel: s.responsavel },
      create: { id: s.id, nome: s.nome, sigla: s.sigla, responsavel: s.responsavel },
    });
  }
  console.log(`  ${secretarias.length} secretarias`);
}

async function seedOrgaos(orgaos: Orgao[]) {
  for (const o of orgaos) {
    await prisma.orgaoConcedente.upsert({
      where: { id: o.id },
      update: { nome: o.nome, esfera: o.esfera },
      create: { id: o.id, nome: o.nome, esfera: o.esfera },
    });
  }
  console.log(`  ${orgaos.length} órgãos concedentes`);
}

async function seedProgramas(programas: Programa[]) {
  for (const p of programas) {
    await prisma.programa.upsert({
      where: { id: p.id },
      update: { nome: p.nome, descricao: p.descricao },
      create: { id: p.id, nome: p.nome, descricao: p.descricao },
    });
  }
  console.log(`  ${programas.length} programas`);
}

async function seedModalidades(modalidades: Catalogo[]) {
  for (const m of modalidades) {
    await prisma.modalidadeRepasseCatalogo.upsert({
      where: { id: m.id },
      update: { nome: m.nome },
      create: { id: m.id, nome: m.nome },
    });
  }
  // remove registros antigos que não fazem parte do catálogo e não estão em uso
  const removidos = await prisma.modalidadeRepasseCatalogo.deleteMany({
    where: {
      id: { notIn: modalidades.map((m) => m.id) },
      convenios: { none: {} },
    },
  });
  console.log(`  ${modalidades.length} modalidades de repasse (${removidos.count} antigas removidas)`);
}

async function seedTiposTermo(tipos: Catalogo[]) {
  for (const t of tipos) {
    await prisma.tipoTermoFormalizacaoCatalogo.upsert({
      where: { id: t.id },
      update: { nome: t.nome },
      create: { id: t.id, nome: t.nome },
    });
  }
  console.log(`  ${tipos.length} tipos de termo de formalização`);
}

async function main() {
  console.log('Seed de configuração:');
  const data = loadData();
  await seedAdmin();
  await seedSecretarias(data.secretarias);
  await seedOrgaos(data.orgaos);
  await seedProgramas(data.programas);
  await seedModalidades(data.modalidadesRepasse);
  await seedTiposTermo(data.tiposTermoFormalizacao);
  console.log('Configuração concluída.');
}

main()
  .catch((err) => {
    console.error('Falha no seed de configuração:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
