import { PrismaClient } from '@prisma/client';

let isConnected = false;

export const prisma = new PrismaClient();

export async function connectDB(): Promise<PrismaClient> {
  if (isConnected) {
    return prisma;
  }

  try {
    await prisma.$connect();
    isConnected = true;
    console.log('✅ MySQL conectado com sucesso (Prisma)');
    return prisma;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await prisma.$disconnect();
    isConnected = false;
    console.log('🔌 MySQL desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar do MySQL:', error);
    throw error;
  }
}

