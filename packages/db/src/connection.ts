import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  // Aceita MONGODB_URI ou DATABASE_URL (para compatibilidade com o backend)
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/spd-gerencia';

  try {
    const connection = await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('✅ MongoDB conectado com sucesso');
    return connection;
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB desconectado');
  } catch (error) {
    console.error('❌ Erro ao desconectar do MongoDB:', error);
    throw error;
  }
}

export { mongoose };

