import { AppError } from '@shared/errors/AppError';
import { CompareSnapshotsUseCase } from '../useCases/CompareSnapshotsUseCase';
import type { ISnapshotRepository, SnapshotResult } from '../repositories/SnapshotRepository';

const makeRepository = (): jest.Mocked<ISnapshotRepository> => ({
  create: jest.fn(),
  findByConvenioId: jest.fn(),
  findById: jest.fn(),
  findByConvenioIdAndVersao: jest.fn(),
  getNextVersao: jest.fn()
});

const makeSnapshot = (versao: number, dados: Record<string, unknown>): SnapshotResult => ({
  id: `snap-${versao}`,
  convenioId: 'conv-1',
  versao,
  dados,
  criadoPorId: 'user-1',
  criadoPorNome: 'João Silva',
  motivoSnapshot: 'Atualização',
  criadoEm: new Date(`2026-01-${String(versao).padStart(2, '0')}T10:00:00Z`)
});

describe('CompareSnapshotsUseCase', () => {
  let sut: CompareSnapshotsUseCase;
  let repository: jest.Mocked<ISnapshotRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new CompareSnapshotsUseCase(repository);
  });

  it('deve retornar diferenças entre duas versões', async () => {
    const snap1 = makeSnapshot(1, {
      titulo: 'Convênio A',
      valorGlobal: 100000,
      status: 'RASCUNHO',
      detalhes: { responsavel: 'Maria', prazo: '30 dias' }
    });
    const snap2 = makeSnapshot(2, {
      titulo: 'Convênio A Atualizado',
      valorGlobal: 150000,
      status: 'EM_EXECUCAO',
      detalhes: { responsavel: 'Maria', prazo: '60 dias' }
    });

    repository.findByConvenioIdAndVersao
      .mockResolvedValueOnce(snap1)
      .mockResolvedValueOnce(snap2);

    const result = await sut.execute('conv-1', 1, 2);

    expect(repository.findByConvenioIdAndVersao).toHaveBeenCalledWith('conv-1', 1);
    expect(repository.findByConvenioIdAndVersao).toHaveBeenCalledWith('conv-1', 2);

    expect(result.versao1).toBe(1);
    expect(result.versao2).toBe(2);
    expect(result.criadoEm1).toEqual(snap1.criadoEm);
    expect(result.criadoEm2).toEqual(snap2.criadoEm);

    expect(result.diferencas).toEqual(
      expect.arrayContaining([
        { campo: 'titulo', valorAnterior: 'Convênio A', valorNovo: 'Convênio A Atualizado' },
        { campo: 'valorGlobal', valorAnterior: 100000, valorNovo: 150000 },
        { campo: 'status', valorAnterior: 'RASCUNHO', valorNovo: 'EM_EXECUCAO' },
        { campo: 'detalhes.prazo', valorAnterior: '30 dias', valorNovo: '60 dias' }
      ])
    );

    // Campos iguais não devem aparecer nas diferenças
    const camposDif = result.diferencas.map(d => d.campo);
    expect(camposDif).not.toContain('detalhes.responsavel');
  });

  it('deve lançar erro quando uma versão não é encontrada', async () => {
    repository.findByConvenioIdAndVersao
      .mockResolvedValueOnce(makeSnapshot(1, { titulo: 'A' }))
      .mockResolvedValueOnce(null);

    await expect(
      sut.execute('conv-1', 1, 99)
    ).rejects.toEqual(expect.objectContaining({
      message: 'Snapshot da versão 99 não encontrado',
      statusCode: 404
    }));
  });

  it('deve retornar lista vazia de diferenças quando os dados são idênticos', async () => {
    const dados = { titulo: 'Mesmo', valorGlobal: 50000, id: 'ignorado' };
    const snap1 = makeSnapshot(1, { ...dados });
    const snap2 = makeSnapshot(2, { ...dados });

    repository.findByConvenioIdAndVersao
      .mockResolvedValueOnce(snap1)
      .mockResolvedValueOnce(snap2);

    const result = await sut.execute('conv-1', 1, 2);

    expect(result.diferencas).toHaveLength(0);
  });
});
