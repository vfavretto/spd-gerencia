import { connectDB } from '@spd/db';
import { createServer } from './server';
import { env } from '@config/env';

async function bootstrap() {
  // Conectar ao MongoDB antes de iniciar o servidor
  await connectDB();

  const app = createServer();

  app.listen(env.port, () => {
    console.log(`[API] rodando em http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Erro ao iniciar a aplicação:', error);
  process.exit(1);
});
