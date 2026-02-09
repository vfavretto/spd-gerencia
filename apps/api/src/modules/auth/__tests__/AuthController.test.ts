import { z, ZodError } from 'zod';

// Replica os schemas do auth.controller.ts para testar isoladamente
const loginSchema = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  senha: z.string().min(6)
});

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['ADMIN', 'ANALISTA', 'ESTAGIARIO', 'OBSERVADOR']).optional().default('ANALISTA')
});

describe('AuthController — Zod Schemas', () => {
  describe('loginSchema', () => {
    it('deve aceitar payload válido', () => {
      const payload = { matricula: '12345', senha: 'senha123' };
      const result = loginSchema.parse(payload);

      expect(result).toEqual(payload);
    });

    it('deve rejeitar matrícula vazia', () => {
      const payload = { matricula: '', senha: 'senha123' };

      expect(() => loginSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar sem matrícula', () => {
      const payload = { senha: 'senha123' };

      expect(() => loginSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const payload = { matricula: '12345', senha: '123' };

      expect(() => loginSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar sem senha', () => {
      const payload = { matricula: '12345' };

      expect(() => loginSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar payload completamente vazio', () => {
      expect(() => loginSchema.parse({})).toThrow(ZodError);
    });
  });

  describe('registerSchema', () => {
    const validPayload = {
      nome: 'João Silva',
      email: 'joao@example.com',
      matricula: '12345',
      senha: 'senha123'
    };

    it('deve aceitar payload válido com role padrão', () => {
      const result = registerSchema.parse(validPayload);

      expect(result).toEqual({ ...validPayload, role: 'ANALISTA' });
    });

    it('deve aceitar payload com role explícito', () => {
      const payload = { ...validPayload, role: 'ADMIN' as const };
      const result = registerSchema.parse(payload);

      expect(result.role).toBe('ADMIN');
    });

    it('deve aceitar todas as roles válidas', () => {
      const roles = ['ADMIN', 'ANALISTA', 'ESTAGIARIO', 'OBSERVADOR'] as const;

      for (const role of roles) {
        const result = registerSchema.parse({ ...validPayload, role });
        expect(result.role).toBe(role);
      }
    });

    it('deve rejeitar role inválida', () => {
      const payload = { ...validPayload, role: 'SUPERUSER' };

      expect(() => registerSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const payload = { ...validPayload, nome: 'J' };

      expect(() => registerSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar e-mail inválido', () => {
      const payload = { ...validPayload, email: 'nao-eh-email' };

      expect(() => registerSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar matrícula vazia', () => {
      const payload = { ...validPayload, matricula: '' };

      expect(() => registerSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const payload = { ...validPayload, senha: '123' };

      expect(() => registerSchema.parse(payload)).toThrow(ZodError);
    });

    it('deve rejeitar sem campos obrigatórios', () => {
      expect(() => registerSchema.parse({})).toThrow(ZodError);
    });

    it('deve rejeitar sem nome', () => {
      const { nome, ...rest } = validPayload;

      expect(() => registerSchema.parse(rest)).toThrow(ZodError);
    });

    it('deve rejeitar sem email', () => {
      const { email, ...rest } = validPayload;

      expect(() => registerSchema.parse(rest)).toThrow(ZodError);
    });
  });
});
