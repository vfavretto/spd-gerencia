import { CreateComunicadoUseCase } from '../useCases/CreateComunicadoUseCase';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';
import type { CreateComunicadoDTO } from '../dto/ComunicadoDTO';
import type { IComunicado } from '@spd/db';

const makeRepository = (): jest.Mocked<ComunicadoRepository> => ({
  list: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

const makeComunicado = (): IComunicado =>
  ({
    id: 'com-1',
    protocolo: 'PROT-001',
    assunto: 'Comunicado de teste',
    conteudo: 'Conteúdo do comunicado',
    tipo: 'ENTRADA',
    dataRegistro: new Date(),
    criadoEm: new Date(),
    atualizadoEm: new Date()
  }) as IComunicado;

describe('CreateComunicadoUseCase', () => {
  let sut: CreateComunicadoUseCase;
  let repository: jest.Mocked<ComunicadoRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new CreateComunicadoUseCase(repository);
  });

  it('deve delegar a criação ao repositório e retornar o resultado', async () => {
    const dto: CreateComunicadoDTO = {
      protocolo: 'PROT-001',
      assunto: 'Comunicado de teste',
      conteudo: 'Conteúdo do comunicado',
      tipo: 'ENTRADA'
    };

    const expectedComunicado = makeComunicado();
    repository.create.mockResolvedValue(expectedComunicado);

    const result = await sut.execute(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedComunicado);
  });
});
