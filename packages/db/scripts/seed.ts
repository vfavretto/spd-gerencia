/**
 * Script de seed inicial para o MongoDB
 * 
 * Este script popula o banco de dados com dados iniciais para desenvolvimento e testes.
 * 
 * Uso: npm run seed
 * 
 * Pré-requisitos:
 * 1. Ter o MongoDB rodando e acessível
 * 2. Configurar a variável de ambiente MONGODB_URI
 */

import path from 'node:path';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente da raiz do monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { connectDB, disconnectDB } from '../src/connection';
import {
  UsuarioModel,
  SecretariaModel,
  OrgaoConcedenteModel,
  ProgramaModel,
  FonteRecursoModel,
  ConvenioModel,
  ComunicadoModel,
  EventoAgendaModel,
  EmendaParlamentarModel,
  FinanceiroContasModel,
  ContratoExecucaoModel,
  MedicaoModel,
  PendenciaModel,
  AditivoModel
} from '../src/models';
import {
  UsuarioRole,
  ConvenioStatus,
  TipoComunicado,
  TipoEvento,
  ModalidadeRepasse,
  EsferaGoverno,
  ModalidadeLicitacao,
  StatusPendencia,
  TipoAditivo
} from '../src/types';

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados MongoDB...\n');

  await connectDB();

  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...');
  await Promise.all([
    AditivoModel.deleteMany({}),
    PendenciaModel.deleteMany({}),
    MedicaoModel.deleteMany({}),
    ContratoExecucaoModel.deleteMany({}),
    FinanceiroContasModel.deleteMany({}),
    EmendaParlamentarModel.deleteMany({}),
    EventoAgendaModel.deleteMany({}),
    ComunicadoModel.deleteMany({}),
    ConvenioModel.deleteMany({}),
    FonteRecursoModel.deleteMany({}),
    ProgramaModel.deleteMany({}),
    OrgaoConcedenteModel.deleteMany({}),
    SecretariaModel.deleteMany({}),
    UsuarioModel.deleteMany({})
  ]);

  // ==================== USUÁRIOS ====================
  console.log('👤 Criando usuários...');
  const senhaHash = await bcrypt.hash('admin123', 10);
  const senhaAnalistaHash = await bcrypt.hash('analista123', 10);

  const [admin, analista] = await Promise.all([
    UsuarioModel.create({
      nome: 'Administrador',
      email: 'admin@spd.gov.br',
      senha: senhaHash,
      role: UsuarioRole.ADMINISTRADOR,
      ativo: true
    }),
    UsuarioModel.create({
      nome: 'João Silva',
      email: 'joao.silva@spd.gov.br',
      senha: senhaAnalistaHash,
      role: UsuarioRole.ANALISTA,
      ativo: true
    }),
    UsuarioModel.create({
      nome: 'Maria Santos',
      email: 'maria.santos@spd.gov.br',
      senha: senhaAnalistaHash,
      role: UsuarioRole.ANALISTA,
      ativo: true
    }),
    UsuarioModel.create({
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@spd.gov.br',
      senha: senhaAnalistaHash,
      role: UsuarioRole.VISUALIZADOR,
      ativo: true
    })
  ]);
  console.log('   ✅ 4 usuários criados');

  // ==================== SECRETARIAS ====================
  console.log('🏛️ Criando secretarias...');
  const secretarias = await SecretariaModel.insertMany([
    { nome: 'Secretaria de Planejamento e Desenvolvimento', sigla: 'SPD', responsavel: 'Dr. Pedro Henrique' },
    { nome: 'Secretaria de Obras e Infraestrutura', sigla: 'SOI', responsavel: 'Eng. Ana Paula' },
    { nome: 'Secretaria de Educação', sigla: 'SMED', responsavel: 'Dra. Luísa Ferreira' },
    { nome: 'Secretaria de Saúde', sigla: 'SMS', responsavel: 'Dr. Ricardo Gomes' },
    { nome: 'Secretaria de Meio Ambiente', sigla: 'SMMA', responsavel: 'Biól. Fernanda Lima' },
    { nome: 'Secretaria de Assistência Social', sigla: 'SMAS', responsavel: 'Assist. José Carlos' }
  ]);
  console.log(`   ✅ ${secretarias.length} secretarias criadas`);

  // ==================== ÓRGÃOS CONCEDENTES ====================
  console.log('🏢 Criando órgãos concedentes...');
  const orgaos = await OrgaoConcedenteModel.insertMany([
    { nome: 'Ministério das Cidades', esfera: EsferaGoverno.FEDERAL, contato: 'cidades@gov.br' },
    { nome: 'Ministério do Desenvolvimento Regional', esfera: EsferaGoverno.FEDERAL, contato: 'mdr@gov.br' },
    { nome: 'Ministério da Educação', esfera: EsferaGoverno.FEDERAL, contato: 'mec@gov.br' },
    { nome: 'Ministério da Saúde', esfera: EsferaGoverno.FEDERAL, contato: 'ms@gov.br' },
    { nome: 'Ministério do Meio Ambiente', esfera: EsferaGoverno.FEDERAL, contato: 'mma@gov.br' },
    { nome: 'Caixa Econômica Federal', esfera: EsferaGoverno.FEDERAL, contato: 'caixa@caixa.gov.br' },
    { nome: 'CDHU - Companhia de Desenvolvimento Habitacional', esfera: EsferaGoverno.ESTADUAL, contato: 'cdhu@sp.gov.br' },
    { nome: 'Secretaria Estadual de Infraestrutura', esfera: EsferaGoverno.ESTADUAL, contato: 'infra@estado.gov.br' },
    { nome: 'FAPESP', esfera: EsferaGoverno.ESTADUAL, contato: 'fapesp@sp.gov.br' }
  ]);
  console.log(`   ✅ ${orgaos.length} órgãos concedentes criados`);

  // ==================== PROGRAMAS ====================
  console.log('📋 Criando programas...');
  const programas = await ProgramaModel.insertMany([
    { nome: 'PAC - Programa de Aceleração do Crescimento', codigo: 'PAC', descricao: 'Programa federal de investimentos em infraestrutura' },
    { nome: 'Minha Casa Minha Vida', codigo: 'MCMV', descricao: 'Programa habitacional do Governo Federal' },
    { nome: 'Brasil Sorridente', codigo: 'BS', descricao: 'Programa de saúde bucal' },
    { nome: 'PROINFRA', codigo: 'PROINFRA', descricao: 'Programa Nacional de Reestruturação e Aquisição de Equipamentos' },
    { nome: 'Novo PAC', codigo: 'NPAC', descricao: 'Nova versão do Programa de Aceleração do Crescimento' },
    { nome: 'FUNDEB', codigo: 'FUNDEB', descricao: 'Fundo de Manutenção e Desenvolvimento da Educação Básica' },
    { nome: 'SUS - Sistema Único de Saúde', codigo: 'SUS', descricao: 'Programa de financiamento da saúde pública' }
  ]);
  console.log(`   ✅ ${programas.length} programas criados`);

  // ==================== FONTES DE RECURSO ====================
  console.log('💰 Criando fontes de recurso...');
  const fontes = await FonteRecursoModel.insertMany([
    { nome: 'Tesouro Nacional', tipo: 'FEDERAL' },
    { nome: 'FGTS', tipo: 'FEDERAL' },
    { nome: 'Emenda Parlamentar Individual', tipo: 'FEDERAL' },
    { nome: 'Emenda de Bancada', tipo: 'FEDERAL' },
    { nome: 'Tesouro Estadual', tipo: 'ESTADUAL' },
    { nome: 'ICMS', tipo: 'ESTADUAL' },
    { nome: 'Recursos Próprios', tipo: 'MUNICIPAL' },
    { nome: 'IPTU', tipo: 'MUNICIPAL' },
    { nome: 'ISS', tipo: 'MUNICIPAL' }
  ]);
  console.log(`   ✅ ${fontes.length} fontes de recurso criadas`);

  // ==================== CONVÊNIOS ====================
  console.log('📄 Criando convênios...');

  const dataBase = new Date();
  const umAnoAtras = new Date(dataBase.getFullYear() - 1, dataBase.getMonth(), 1);
  const umAnoFrente = new Date(dataBase.getFullYear() + 1, dataBase.getMonth(), 1);
  const doisAnosFrente = new Date(dataBase.getFullYear() + 2, dataBase.getMonth(), 1);
  const seisAnosFrente = new Date(dataBase.getFullYear() + 6, dataBase.getMonth(), 1);

  const convenios = await ConvenioModel.insertMany([
    {
      codigo: 'CONV-2024-001',
      titulo: 'Construção de Creche Municipal - Bairro Jardim das Flores',
      objeto: 'Construção de creche com capacidade para 150 crianças',
      status: ConvenioStatus.EM_EXECUCAO,
      descricao: 'Projeto para construção de creche municipal no bairro Jardim das Flores, incluindo área de recreação e refeitório.',
      numeroProposta: 'PROP-2024-00123',
      dataInicioProcesso: umAnoAtras,
      modalidadeRepasse: ModalidadeRepasse.CONVENIO,
      termoFormalizacao: 'Convênio',
      numeroTermo: '123456/2024',
      esfera: EsferaGoverno.FEDERAL,
      ministerioOrgao: 'Ministério da Educação',
      valorGlobal: 2500000.00,
      valorRepasse: 2000000.00,
      valorContrapartida: 500000.00,
      dataAssinatura: new Date(umAnoAtras.getTime() + 30 * 24 * 60 * 60 * 1000),
      dataInicioVigencia: new Date(umAnoAtras.getTime() + 60 * 24 * 60 * 60 * 1000),
      dataFimVigencia: umAnoFrente,
      secretariaId: secretarias[2]._id, // SMED
      orgaoId: orgaos[2]._id, // MEC
      programaId: programas[3]._id, // PROINFRA
      fonteId: fontes[0]._id, // Tesouro Nacional
      etapas: [
        { _id: new Types.ObjectId(), titulo: 'Licitação', situacao: 'CONCLUIDA', dataPrevista: umAnoAtras, dataRealizada: umAnoAtras, responsavel: 'Setor de Licitações' },
        { _id: new Types.ObjectId(), titulo: 'Fundação', situacao: 'CONCLUIDA', dataPrevista: new Date(), responsavel: 'Construtora ABC' },
        { _id: new Types.ObjectId(), titulo: 'Estrutura', situacao: 'EM_ANDAMENTO', dataPrevista: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), responsavel: 'Construtora ABC' },
        { _id: new Types.ObjectId(), titulo: 'Acabamento', situacao: 'PENDENTE', dataPrevista: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), responsavel: 'Construtora ABC' }
      ]
    },
    {
      codigo: 'CONV-2024-002',
      titulo: 'Pavimentação Asfáltica - Av. Principal',
      objeto: 'Pavimentação asfáltica de 5km da Avenida Principal',
      status: ConvenioStatus.APROVADO,
      descricao: 'Pavimentação, drenagem e sinalização da Avenida Principal.',
      numeroProposta: 'PROP-2024-00456',
      dataInicioProcesso: new Date(),
      modalidadeRepasse: ModalidadeRepasse.CONTRATO_REPASSE,
      numeroTermo: '789012/2024',
      esfera: EsferaGoverno.FEDERAL,
      ministerioOrgao: 'Ministério das Cidades',
      valorGlobal: 8500000.00,
      valorRepasse: 7000000.00,
      valorContrapartida: 1500000.00,
      dataAssinatura: new Date(),
      dataInicioVigencia: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      dataFimVigencia: doisAnosFrente,
      secretariaId: secretarias[1]._id, // SOI
      orgaoId: orgaos[0]._id, // Min. Cidades
      programaId: programas[0]._id, // PAC
      fonteId: fontes[1]._id // FGTS
    },
    {
      codigo: 'CONV-2024-003',
      titulo: 'Reforma da UBS Central',
      objeto: 'Reforma e ampliação da Unidade Básica de Saúde Central',
      status: ConvenioStatus.EM_EXECUCAO,
      descricao: 'Reforma completa da UBS Central, incluindo ampliação da área de atendimento e adequação às normas de acessibilidade.',
      numeroProposta: 'PROP-2023-00789',
      dataInicioProcesso: new Date(dataBase.getFullYear() - 1, 6, 1),
      modalidadeRepasse: ModalidadeRepasse.CONVENIO,
      numeroTermo: '456789/2023',
      esfera: EsferaGoverno.FEDERAL,
      ministerioOrgao: 'Ministério da Saúde',
      valorGlobal: 1800000.00,
      valorRepasse: 1500000.00,
      valorContrapartida: 300000.00,
      dataAssinatura: new Date(dataBase.getFullYear() - 1, 7, 15),
      dataInicioVigencia: new Date(dataBase.getFullYear() - 1, 8, 1),
      dataFimVigencia: new Date(dataBase.getFullYear(), 11, 31),
      secretariaId: secretarias[3]._id, // SMS
      orgaoId: orgaos[3]._id, // Min. Saúde
      programaId: programas[6]._id, // SUS
      fonteId: fontes[0]._id // Tesouro Nacional
    },
    {
      codigo: 'CONV-2024-004',
      titulo: 'Construção de 200 Unidades Habitacionais',
      objeto: 'Construção de conjunto habitacional com 200 unidades',
      status: ConvenioStatus.RASCUNHO,
      descricao: 'Projeto habitacional para famílias de baixa renda no bairro Nova Esperança.',
      numeroProposta: 'PROP-2024-01000',
      modalidadeRepasse: ModalidadeRepasse.CONTRATO_REPASSE,
      esfera: EsferaGoverno.FEDERAL,
      valorGlobal: 45000000.00,
      valorRepasse: 40000000.00,
      valorContrapartida: 5000000.00,
      secretariaId: secretarias[1]._id, // SOI
      orgaoId: orgaos[5]._id, // Caixa
      programaId: programas[1]._id, // MCMV
      fonteId: fontes[1]._id // FGTS
    },
    {
      codigo: 'CONV-2023-015',
      titulo: 'Implantação de Parque Linear',
      objeto: 'Criação de parque linear com 2km de extensão',
      status: ConvenioStatus.CONCLUIDO,
      descricao: 'Parque linear com ciclovias, áreas de lazer e recuperação de APP.',
      numeroProposta: 'PROP-2022-00333',
      dataInicioProcesso: new Date(dataBase.getFullYear() - 2, 3, 1),
      modalidadeRepasse: ModalidadeRepasse.TERMO_FOMENTO,
      numeroTermo: '111222/2022',
      esfera: EsferaGoverno.ESTADUAL,
      valorGlobal: 3200000.00,
      valorRepasse: 2800000.00,
      valorContrapartida: 400000.00,
      dataAssinatura: new Date(dataBase.getFullYear() - 2, 4, 1),
      dataInicioVigencia: new Date(dataBase.getFullYear() - 2, 5, 1),
      dataFimVigencia: new Date(dataBase.getFullYear() - 1, 11, 31),
      dataPrestacaoContas: new Date(dataBase.getFullYear(), 1, 28),
      secretariaId: secretarias[4]._id, // SMMA
      orgaoId: orgaos[7]._id, // Sec. Estadual Infra
      fonteId: fontes[4]._id // Tesouro Estadual
    }
  ]);
  console.log(`   ✅ ${convenios.length} convênios criados`);

  // ==================== COMUNICADOS ====================
  console.log('📨 Criando comunicados...');
  const comunicados = await ComunicadoModel.insertMany([
    {
      protocolo: 'COM-2024-0001',
      assunto: 'Solicitação de Documentação Complementar',
      conteudo: 'Solicitamos o envio de documentação complementar referente ao convênio CONV-2024-001 para dar prosseguimento ao processo.',
      tipo: TipoComunicado.ENTRADA,
      status: 'RECEBIDO',
      dataRegistro: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      origem: 'Ministério da Educação',
      destino: 'SPD',
      responsavel: 'João Silva',
      convenioId: convenios[0]._id,
      criadoPorId: analista._id
    },
    {
      protocolo: 'COM-2024-0002',
      assunto: 'Resposta - Documentação Complementar',
      conteudo: 'Segue em anexo a documentação complementar solicitada.',
      tipo: TipoComunicado.SAIDA,
      status: 'ENVIADO',
      dataRegistro: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      origem: 'SPD',
      destino: 'Ministério da Educação',
      responsavel: 'João Silva',
      convenioId: convenios[0]._id,
      criadoPorId: analista._id
    },
    {
      protocolo: 'COM-2024-0003',
      assunto: 'Notificação de Liberação de Parcela',
      conteudo: 'Informamos que foi liberada a 2ª parcela do repasse referente ao convênio.',
      tipo: TipoComunicado.ENTRADA,
      status: 'RECEBIDO',
      dataRegistro: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      origem: 'Caixa Econômica Federal',
      destino: 'Secretaria de Obras',
      responsavel: 'Maria Santos',
      convenioId: convenios[1]._id,
      criadoPorId: admin._id
    }
  ]);
  console.log(`   ✅ ${comunicados.length} comunicados criados`);

  // ==================== EVENTOS DA AGENDA ====================
  console.log('📅 Criando eventos da agenda...');
  const eventos = await EventoAgendaModel.insertMany([
    {
      titulo: 'Reunião de Acompanhamento - Creche Jardim das Flores',
      descricao: 'Reunião mensal de acompanhamento do andamento da obra',
      tipo: TipoEvento.REUNIAO,
      dataInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      local: 'Sala de Reuniões SPD',
      responsavel: 'João Silva',
      convenioId: convenios[0]._id
    },
    {
      titulo: 'Vencimento Etapa - Estrutura',
      descricao: 'Prazo final para conclusão da etapa de estrutura',
      tipo: TipoEvento.VENCIMENTO_ETAPA,
      dataInicio: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      dataFim: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      convenioId: convenios[0]._id
    },
    {
      titulo: 'Prestação de Contas Parcial',
      descricao: 'Entrega da prestação de contas parcial do 1º semestre',
      tipo: TipoEvento.PRESTACAO_CONTAS,
      dataInicio: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      local: 'Online',
      responsavel: 'Maria Santos',
      convenioId: convenios[2]._id
    },
    {
      titulo: 'Visita Técnica - Pavimentação',
      descricao: 'Visita técnica para início das obras de pavimentação',
      tipo: TipoEvento.OUTROS,
      dataInicio: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      dataFim: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      local: 'Av. Principal',
      responsavel: 'Eng. Ana Paula',
      convenioId: convenios[1]._id
    }
  ]);
  console.log(`   ✅ ${eventos.length} eventos criados`);

  // ==================== EMENDAS PARLAMENTARES ====================
  console.log('📝 Criando emendas parlamentares...');
  const emendas = await EmendaParlamentarModel.insertMany([
    {
      nomeParlamentar: 'Dep. Roberto Silva',
      partido: 'PARTIDO A',
      codigoEmenda: 'EMD-2024-001234',
      funcao: '12 - Educação',
      subfuncao: '365 - Educação Infantil',
      programa: 'PROINFRA',
      valorIndicado: 500000.00,
      anoEmenda: 2024,
      convenioId: convenios[0]._id
    },
    {
      nomeParlamentar: 'Sen. Maria Fernandes',
      partido: 'PARTIDO B',
      codigoEmenda: 'EMD-2024-005678',
      funcao: '15 - Urbanismo',
      subfuncao: '451 - Infraestrutura Urbana',
      programa: 'PAC',
      valorIndicado: 2000000.00,
      anoEmenda: 2024,
      convenioId: convenios[1]._id
    },
    {
      nomeParlamentar: 'Dep. Carlos Mendes',
      partido: 'PARTIDO C',
      codigoEmenda: 'EMD-2024-009012',
      funcao: '10 - Saúde',
      subfuncao: '301 - Atenção Básica',
      programa: 'SUS',
      valorIndicado: 300000.00,
      anoEmenda: 2024,
      convenioId: convenios[2]._id
    }
  ]);
  console.log(`   ✅ ${emendas.length} emendas parlamentares criadas`);

  // ==================== DADOS FINANCEIROS ====================
  console.log('🏦 Criando dados financeiros...');
  const financeiros = await FinanceiroContasModel.insertMany([
    {
      banco: 'Caixa Econômica Federal',
      agencia: '0001',
      contaBancaria: '123456-7',
      valorLiberadoTotal: 1000000.00,
      saldoRendimentos: 15000.00,
      fichasOrcamentarias: 'Ficha 100, 101, 102',
      observacoes: 'Conta específica do convênio',
      convenioId: convenios[0]._id
    },
    {
      banco: 'Caixa Econômica Federal',
      agencia: '0001',
      contaBancaria: '789012-3',
      valorLiberadoTotal: 0,
      convenioId: convenios[1]._id
    },
    {
      banco: 'Banco do Brasil',
      agencia: '1234',
      contaBancaria: '456789-0',
      valorLiberadoTotal: 1200000.00,
      saldoRendimentos: 8500.00,
      fichasOrcamentarias: 'Ficha 200, 201',
      convenioId: convenios[2]._id
    }
  ]);
  console.log(`   ✅ ${financeiros.length} registros financeiros criados`);

  // ==================== CONTRATOS DE EXECUÇÃO ====================
  console.log('📃 Criando contratos de execução...');
  const contratos = await ContratoExecucaoModel.insertMany([
    {
      numProcessoLicitatorio: 'LIC-2024-00123',
      modalidadeLicitacao: ModalidadeLicitacao.CONCORRENCIA,
      numeroContrato: 'CTR-2024-001',
      contratadaCnpj: '12.345.678/0001-90',
      contratadaNome: 'Construtora ABC Ltda',
      dataAssinatura: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      dataVigenciaInicio: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      dataVigenciaFim: umAnoFrente,
      dataOIS: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000),
      valorContrato: 2300000.00,
      valorExecutado: 920000.00,
      engenheiroResponsavel: 'Eng. Paulo Roberto',
      creaEngenheiro: 'CREA-SP 123456',
      artRrt: 'ART-2024-001234',
      situacao: 'EM_EXECUCAO',
      convenioId: convenios[0]._id
    },
    {
      numProcessoLicitatorio: 'LIC-2023-00456',
      modalidadeLicitacao: ModalidadeLicitacao.TOMADA_PRECOS,
      numeroContrato: 'CTR-2023-015',
      contratadaCnpj: '98.765.432/0001-10',
      contratadaNome: 'Reformas & Cia Ltda',
      dataAssinatura: new Date(dataBase.getFullYear() - 1, 8, 1),
      dataVigenciaInicio: new Date(dataBase.getFullYear() - 1, 8, 15),
      dataVigenciaFim: new Date(dataBase.getFullYear(), 8, 15),
      dataOIS: new Date(dataBase.getFullYear() - 1, 8, 20),
      valorContrato: 1650000.00,
      valorExecutado: 1320000.00,
      engenheiroResponsavel: 'Eng. Carla Souza',
      creaEngenheiro: 'CREA-SP 654321',
      artRrt: 'ART-2023-005678',
      situacao: 'EM_EXECUCAO',
      convenioId: convenios[2]._id
    }
  ]);
  console.log(`   ✅ ${contratos.length} contratos criados`);

  // ==================== MEDIÇÕES ====================
  console.log('📐 Criando medições...');
  const medicoes = await MedicaoModel.insertMany([
    {
      numeroMedicao: 1,
      dataMedicao: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      percentualFisico: 15.00,
      valorMedido: 345000.00,
      dataPagamento: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      valorPago: 345000.00,
      situacao: 'PAGA',
      contratoId: contratos[0]._id
    },
    {
      numeroMedicao: 2,
      dataMedicao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      percentualFisico: 30.00,
      valorMedido: 345000.00,
      dataPagamento: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      valorPago: 345000.00,
      situacao: 'PAGA',
      contratoId: contratos[0]._id
    },
    {
      numeroMedicao: 3,
      dataMedicao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      percentualFisico: 40.00,
      valorMedido: 230000.00,
      situacao: 'EM_ANALISE',
      observacoes: 'Aguardando aprovação do fiscal',
      contratoId: contratos[0]._id
    },
    {
      numeroMedicao: 1,
      dataMedicao: new Date(dataBase.getFullYear() - 1, 10, 1),
      percentualFisico: 40.00,
      valorMedido: 660000.00,
      dataPagamento: new Date(dataBase.getFullYear() - 1, 10, 20),
      valorPago: 660000.00,
      situacao: 'PAGA',
      contratoId: contratos[1]._id
    },
    {
      numeroMedicao: 2,
      dataMedicao: new Date(dataBase.getFullYear(), 1, 1),
      percentualFisico: 80.00,
      valorMedido: 660000.00,
      dataPagamento: new Date(dataBase.getFullYear(), 1, 25),
      valorPago: 660000.00,
      situacao: 'PAGA',
      contratoId: contratos[1]._id
    }
  ]);
  console.log(`   ✅ ${medicoes.length} medições criadas`);

  // ==================== PENDÊNCIAS ====================
  // Prioridade: 1 = Alta, 2 = Média, 3 = Baixa
  console.log('⚠️ Criando pendências...');
  const pendencias = await PendenciaModel.insertMany([
    {
      descricao: 'Regularizar ART junto ao CREA',
      responsavel: 'Eng. Paulo Roberto',
      prazo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: StatusPendencia.ABERTA,
      prioridade: 1, // Alta
      convenioId: convenios[0]._id,
      criadoPorId: analista._id
    },
    {
      descricao: 'Enviar relatório fotográfico da medição 3',
      responsavel: 'Fiscal João',
      prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: StatusPendencia.EM_ANDAMENTO,
      prioridade: 2, // Média
      convenioId: convenios[0]._id,
      criadoPorId: analista._id
    },
    {
      descricao: 'Obter licença ambiental para início das obras',
      responsavel: 'SMMA',
      prazo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: StatusPendencia.ABERTA,
      prioridade: 1, // Alta
      convenioId: convenios[1]._id,
      criadoPorId: admin._id
    },
    {
      descricao: 'Atualizar cronograma físico-financeiro',
      responsavel: 'Maria Santos',
      prazo: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: StatusPendencia.RESOLVIDA,
      prioridade: 2, // Média
      resolucao: 'Cronograma atualizado e enviado ao órgão concedente',
      dataResolucao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      convenioId: convenios[2]._id,
      criadoPorId: analista._id
    }
  ]);
  console.log(`   ✅ ${pendencias.length} pendências criadas`);

  // ==================== ADITIVOS ====================
  console.log('➕ Criando aditivos...');
  const aditivos = await AditivoModel.insertMany([
    {
      numeroAditivo: 1,
      tipoAditivo: TipoAditivo.PRAZO,
      dataAssinatura: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      novaVigencia: new Date(umAnoFrente.getTime() + 180 * 24 * 60 * 60 * 1000),
      motivo: 'Atraso nas obras devido a período chuvoso',
      justificativa: 'Conforme relatório técnico, as chuvas intensas dos meses de janeiro e fevereiro impossibilitaram a continuidade das obras de fundação.',
      convenioId: convenios[0]._id
    },
    {
      numeroAditivo: 1,
      tipoAditivo: TipoAditivo.VALOR,
      dataAssinatura: new Date(dataBase.getFullYear(), 2, 15),
      valorAcrescimo: 150000.00,
      motivo: 'Acréscimo de serviços',
      justificativa: 'Necessidade de adequação do projeto às novas normas de acessibilidade NBR 9050:2024.',
      convenioId: convenios[2]._id
    }
  ]);
  console.log(`   ✅ ${aditivos.length} aditivos criados`);

  // ==================== RESUMO ====================
  await disconnectDB();

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo dos dados criados:');
  console.log('   ├─ Usuários: 4');
  console.log(`   ├─ Secretarias: ${secretarias.length}`);
  console.log(`   ├─ Órgãos Concedentes: ${orgaos.length}`);
  console.log(`   ├─ Programas: ${programas.length}`);
  console.log(`   ├─ Fontes de Recurso: ${fontes.length}`);
  console.log(`   ├─ Convênios: ${convenios.length}`);
  console.log(`   ├─ Comunicados: ${comunicados.length}`);
  console.log(`   ├─ Eventos: ${eventos.length}`);
  console.log(`   ├─ Emendas: ${emendas.length}`);
  console.log(`   ├─ Financeiros: ${financeiros.length}`);
  console.log(`   ├─ Contratos: ${contratos.length}`);
  console.log(`   ├─ Medições: ${medicoes.length}`);
  console.log(`   ├─ Pendências: ${pendencias.length}`);
  console.log(`   └─ Aditivos: ${aditivos.length}`);
  console.log('\n📋 Credenciais de acesso:');
  console.log('   ├─ Admin: admin@spd.gov.br / admin123');
  console.log('   └─ Analista: joao.silva@spd.gov.br / analista123');
}

seed().catch((error) => {
  console.error('❌ Erro no seed:', error);
  process.exit(1);
});
