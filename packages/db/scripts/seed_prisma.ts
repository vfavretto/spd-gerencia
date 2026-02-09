import path from 'node:path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/connection';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function seed() {
  console.log('🌱 Seed inicial (Prisma/MySQL)...');

  const senhaHash = await bcrypt.hash('admin123', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@spd.gov.br' },
    update: {
      nome: 'Administrador',
      senha: senhaHash,
      matricula: '00001',
      role: 'ADMIN',
      ativo: true
    },
    create: {
      nome: 'Administrador',
      email: 'admin@spd.gov.br',
      matricula: '00001',
      senha: senhaHash,
      role: 'ADMIN',
      ativo: true
    }
  });

  console.log('✅ Usuário admin criado:');
  console.log('   Matrícula: 00001');
  console.log('   Senha: admin123');
}

seed()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
