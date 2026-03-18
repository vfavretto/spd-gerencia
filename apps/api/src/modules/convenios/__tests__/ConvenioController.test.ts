import type { Request, Response } from 'express';
import { ConvenioController } from '../http/convenio.controller';
import { CreateConvenioUseCase } from '../useCases/CreateConvenioUseCase';
import { AuditService } from '../../auditoria/services/AuditService';

const mockExecute = jest.fn();

jest.mock('../useCases/CreateConvenioUseCase', () => ({
  CreateConvenioUseCase: jest.fn().mockImplementation(() => ({
    execute: mockExecute
  }))
}));

jest.mock('../../auditoria/services/AuditService', () => ({
  AuditService: {
    logCreate: jest.fn()
  }
}));

const makeReq = (body: Record<string, unknown>): Request =>
  ({
    body,
    user: { id: 'admin-1', nome: 'Admin', email: 'admin@example.com', role: 'ADMIN' },
    ip: '127.0.0.1',
    get: jest.fn().mockReturnValue('Jest')
  }) as unknown as Request;

const makeRes = (): Response => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  return res as unknown as Response;
};

describe('ConvenioController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecute.mockResolvedValue({ id: 'conv-1' });
  });

  it('deve preservar valorGlobal enviado explicitamente no create', async () => {
    const controller = new ConvenioController();
    const req = makeReq({
      codigo: 'CONV-001',
      titulo: 'Convênio teste',
      objeto: 'Objeto',
      secretariaId: 'sec-1',
      valorGlobal: 999,
      valorRepasse: 300,
      valorContrapartida: 200
    });
    const res = makeRes();

    await controller.create(req, res);

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
      valorGlobal: 999,
      valorRepasse: 300,
      valorContrapartida: 200
    }));
    expect(AuditService.logCreate).toHaveBeenCalled();
  });

  it('deve calcular valorGlobal quando ele não for enviado', async () => {
    const controller = new ConvenioController();
    const req = makeReq({
      codigo: 'CONV-001',
      titulo: 'Convênio teste',
      objeto: 'Objeto',
      secretariaId: 'sec-1',
      valorRepasse: 300,
      valorContrapartida: 200
    });
    const res = makeRes();

    await controller.create(req, res);

    expect(mockExecute).toHaveBeenCalledWith(expect.objectContaining({
      valorGlobal: 500,
      valorRepasse: 300,
      valorContrapartida: 200
    }));
  });
});
