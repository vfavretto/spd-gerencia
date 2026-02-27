import { AppError } from '@shared/errors/AppError';
import { CreateAditivoUseCase } from '../useCases/CreateAditivoUseCase';
import type { AditivoRepository } from '../repositories/AditivoRepository';

const makeRepository = (): jest.Mocked<AditivoRepository> => ({
  listByConvenio: jest.fn(),
  findById: jest.fn(),
  getNextNumeroAditivo: jest.fn(),
  getUltimaVigencia: jest.fn(),
  isContratoDoConvenio: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

describe('CreateAditivoUseCase', () => {
  it('deve validar vinculo contrato-convenio para aditivo de contrato', async () => {
    const repository = makeRepository();
    repository.isContratoDoConvenio.mockResolvedValue(false);

    const sut = new CreateAditivoUseCase(repository);

    await expect(
      sut.execute({
        convenioId: 'conv-1',
        contratoId: 'ctr-1',
        tipoAditivo: 'ACRESCIMO'
      })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Contrato não pertence ao convênio informado',
      statusCode: 400
    } as Partial<AppError>));

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('deve numerar aditivo por contrato quando contratoId for informado', async () => {
    const repository = makeRepository();

    repository.isContratoDoConvenio.mockResolvedValue(true);
    repository.getNextNumeroAditivo.mockResolvedValue(3);
    repository.create.mockResolvedValue({
      id: 'adit-1',
      convenioId: 'conv-1',
      contratoId: 'ctr-1',
      numeroAditivo: 3,
      tipoAditivo: 'ACRESCIMO',
      criadoEm: new Date(),
      atualizadoEm: new Date()
    } as never);

    const sut = new CreateAditivoUseCase(repository);

    const result = await sut.execute({
      convenioId: 'conv-1',
      contratoId: 'ctr-1',
      tipoAditivo: 'ACRESCIMO'
    });

    expect(repository.getNextNumeroAditivo).toHaveBeenCalledWith('conv-1', 'ctr-1');
    expect(repository.create).toHaveBeenCalledWith({
      convenioId: 'conv-1',
      contratoId: 'ctr-1',
      tipoAditivo: 'ACRESCIMO',
      numeroAditivo: 3
    });
    expect(result.numeroAditivo).toBe(3);
  });
});
