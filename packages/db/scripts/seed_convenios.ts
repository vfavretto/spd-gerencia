import path from 'node:path';
import dotenv from 'dotenv';
import { prisma } from '../src/connection';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export async function seedConvenios(): Promise<void> {
  console.log('🌱 Iniciando seed (Modalidades de Repasse)...\n');

  // ─── Modalidades de Repasse ─────────────────────────────

  console.log('🔁 Criando modalidades de repasse...');
  await prisma.modalidadeRepasseCatalogo.upsert({
    where: { id: 'modalidade-convenio' },
    update: {},
    create: { id: 'modalidade-convenio', nome: 'Convênio' },
  });

  await prisma.modalidadeRepasseCatalogo.upsert({
    where: { id: 'modalidade-contrato-repasse' },
    update: {},
    create: { id: 'modalidade-contrato-repasse', nome: 'Contrato de Repasse' },
  });

  await prisma.modalidadeRepasseCatalogo.upsert({
    where: { id: 'modalidade-termo-fomento' },
    update: {},
    create: { id: 'modalidade-termo-fomento', nome: 'Termo de Fomento' },
  });

  await prisma.modalidadeRepasseCatalogo.upsert({
    where: { id: 'modalidade-termo-colaboracao' },
    update: {},
    create: { id: 'modalidade-termo-colaboracao', nome: 'Termo de Colaboração' },
  });

  console.log('✅ Modalidades de repasse criadas com sucesso!');
}

if (require.main === module) {
  seedConvenios()
    .catch((e: unknown) => {
      console.error('❌ Erro no seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
