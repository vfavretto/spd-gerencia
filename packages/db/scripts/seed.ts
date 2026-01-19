/**
 * Script de seed para o MySQL com Prisma
 * 
 * Popula o banco de dados com dados de teste para desenvolvimento.
 * 
 * Uso: npm run seed
 * 
 * Pré-requisitos:
 * 1. Ter o MySQL rodando e acessível
 * 2. Ter executado prisma migrate dev
 * 3. Configurar a variável DATABASE_URL no .env
 */

import path from 'node:path';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente da raiz do monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados MySQL...\n');

  // Limpar dados existentes (ordem importa por causa das FKs)
  console.log('🧹 Limpando dados existentes...');
  await prisma.aditivo.deleteMany();
  await prisma.pendencia.deleteMany();
  await prisma.medicao.deleteMany();
  await prisma.contratoExecucao.deleteMany();
  await prisma.notaEmpenho.deleteMany();
  await prisma.fichaOrcamentaria.deleteMany();
  await prisma.financeiroContas.deleteMany();
  await prisma.emendaParlamentar.deleteMany();
  await prisma.eventoAgenda.deleteMany();
  await prisma.comunicado.deleteMany();
  await prisma.convenio.deleteMany();
  await prisma.fonteRecurso.deleteMany();
  await prisma.programa.deleteMany();
  await prisma.orgaoConcedente.deleteMany();
  await prisma.secretaria.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('   ✅ Dados limpos');

  // ==================== USUÁRIOS ====================
  console.log('👤 Criando usuários...');
  const senhaHash = await bcrypt.hash('admin123', 10);
  const senhaAnalistaHash = await bcrypt.hash('analista123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: 'admin@spd.gov.br',
      senha: senhaHash,
      role: 'ADMINISTRADOR',
      ativo: true
    }
  });

  const analista = await prisma.usuario.create({
    data: {
      nome: 'João Silva',
      email: 'joao.silva@spd.gov.br',
      senha: senhaAnalistaHash,
      role: 'ANALISTA',
      ativo: true
    }
  });

  await prisma.usuario.createMany({
    data: [
      { nome: 'Maria Santos', email: 'maria.santos@spd.gov.br', senha: senhaAnalistaHash, role: 'ANALISTA', ativo: true },
      { nome: 'Carlos Oliveira', email: 'carlos.oliveira@spd.gov.br', senha: senhaAnalistaHash, role: 'VISUALIZADOR', ativo: true }
    ]
  });
  console.log('   ✅ 4 usuários criados');

  // ==================== SECRETARIAS ====================
  console.log('🏛️ Criando secretarias...');
  const secretariasData = [
    { nome: 'Secretaria de Planejamento e Desenvolvimento', sigla: 'SPD', responsavel: 'Dr. Pedro Henrique' },
    { nome: 'Secretaria de Obras e Infraestrutura', sigla: 'SOI', responsavel: 'Eng. Ana Paula' },
    { nome: 'Secretaria de Educação', sigla: 'SMED', responsavel: 'Dra. Luísa Ferreira' },
    { nome: 'Secretaria de Saúde', sigla: 'SMS', responsavel: 'Dr. Ricardo Gomes' },
    { nome: 'Secretaria de Meio Ambiente', sigla: 'SMMA', responsavel: 'Biól. Fernanda Lima' },
    { nome: 'Secretaria de Assistência Social', sigla: 'SMAS', responsavel: 'Assist. José Carlos' }
  ];
  
  const secretarias: { id: string; nome: string }[] = [];
  for (const s of secretariasData) {
    const created = await prisma.secretaria.create({ data: s });
    secretarias.push(created);
  }
  console.log(`   ✅ ${secretarias.length} secretarias criadas`);

  // ==================== ÓRGÃOS CONCEDENTES ====================
  console.log('🏢 Criando órgãos concedentes...');
  const orgaosData = [
    { nome: 'Ministério das Cidades', esfera: 'FEDERAL', contato: 'cidades@gov.br' },
    { nome: 'Ministério do Desenvolvimento Regional', esfera: 'FEDERAL', contato: 'mdr@gov.br' },
    { nome: 'Ministério da Educação', esfera: 'FEDERAL', contato: 'mec@gov.br' },
    { nome: 'Ministério da Saúde', esfera: 'FEDERAL', contato: 'ms@gov.br' },
    { nome: 'Ministério do Meio Ambiente', esfera: 'FEDERAL', contato: 'mma@gov.br' },
    { nome: 'Caixa Econômica Federal', esfera: 'FEDERAL', contato: 'caixa@caixa.gov.br' },
    { nome: 'CDHU - Companhia de Desenvolvimento Habitacional', esfera: 'ESTADUAL', contato: 'cdhu@sp.gov.br' },
    { nome: 'Secretaria Estadual de Infraestrutura', esfera: 'ESTADUAL', contato: 'infra@estado.gov.br' },
    { nome: 'FAPESP', esfera: 'ESTADUAL', contato: 'fapesp@sp.gov.br' }
  ];
  
  const orgaos: { id: string; nome: string }[] = [];
  for (const o of orgaosData) {
    const created = await prisma.orgaoConcedente.create({ data: o });
    orgaos.push(created);
  }
  console.log(`   ✅ ${orgaos.length} órgãos concedentes criados`);

  // ==================== PROGRAMAS ====================
  console.log('📋 Criando programas...');
  const programasData = [
    { nome: 'PAC - Programa de Aceleração do Crescimento', codigo: 'PAC', descricao: 'Programa federal de investimentos em infraestrutura' },
    { nome: 'Minha Casa Minha Vida', codigo: 'MCMV', descricao: 'Programa habitacional do Governo Federal' },
    { nome: 'Brasil Sorridente', codigo: 'BS', descricao: 'Programa de saúde bucal' },
    { nome: 'PROINFRA', codigo: 'PROINFRA', descricao: 'Programa Nacional de Reestruturação e Aquisição de Equipamentos' },
    { nome: 'Novo PAC', codigo: 'NPAC', descricao: 'Nova versão do Programa de Aceleração do Crescimento' },
    { nome: 'FUNDEB', codigo: 'FUNDEB', descricao: 'Fundo de Manutenção e Desenvolvimento da Educação Básica' },
    { nome: 'SUS - Sistema Único de Saúde', codigo: 'SUS', descricao: 'Programa de financiamento da saúde pública' }
  ];
  
  const programas: { id: string; nome: string }[] = [];
  for (const p of programasData) {
    const created = await prisma.programa.create({ data: p });
    programas.push(created);
  }
  console.log(`   ✅ ${programas.length} programas criados`);

  // ==================== FONTES DE RECURSO ====================
  console.log('💰 Criando fontes de recurso...');
  const fontesData = [
    { nome: 'Tesouro Nacional', tipo: 'FEDERAL' },
    { nome: 'FGTS', tipo: 'FEDERAL' },
    { nome: 'Emenda Parlamentar Individual', tipo: 'FEDERAL' },
    { nome: 'Emenda de Bancada', tipo: 'FEDERAL' },
    { nome: 'Tesouro Estadual', tipo: 'ESTADUAL' },
    { nome: 'ICMS', tipo: 'ESTADUAL' },
    { nome: 'Recursos Próprios', tipo: 'MUNICIPAL' },
    { nome: 'IPTU', tipo: 'MUNICIPAL' },
    { nome: 'ISS', tipo: 'MUNICIPAL' }
  ];
  
  const fontes: { id: string; nome: string }[] = [];
  for (const f of fontesData) {
    const created = await prisma.fonteRecurso.create({ data: f });
    fontes.push(created);
  }
  console.log(`   ✅ ${fontes.length} fontes de recurso criadas`);

  // ==================== CONVÊNIOS ====================
  console.log('📄 Criando convênios...');

  const hoje = new Date();
  const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1);
  const umAnoFrente = new Date(hoje.getFullYear() + 1, hoje.getMonth(), 1);
  const doisAnosFrente = new Date(hoje.getFullYear() + 2, hoje.getMonth(), 1);
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Convênio 1 - EM EXECUÇÃO (Creche)
  const conv1 = await prisma.convenio.create({
    data: {
      codigo: 'CONV-2024-001',
      titulo: 'Construção de Creche Municipal - Bairro Jardim das Flores',
      objeto: 'Construção de creche com capacidade para 150 crianças, incluindo área de recreação, refeitório e salas de aula.',
      status: 'EM_EXECUCAO',
      descricao: 'Projeto para construção de creche municipal no bairro Jardim das Flores.',
      numeroProposta: 'PROP-2024-00123',
      dataInicioProcesso: umAnoAtras,
      modalidadeRepasse: 'CONVENIO',
      termoFormalizacao: 'Convênio',
      numeroTermo: '123456/2024',
      esfera: 'FEDERAL',
      ministerioOrgao: 'Ministério da Educação',
      valorGlobal: 2500000.00,
      valorRepasse: 2000000.00,
      valorContrapartida: 500000.00,
      dataAssinatura: new Date(umAnoAtras.getTime() + 30 * 24 * 60 * 60 * 1000),
      dataInicioVigencia: new Date(umAnoAtras.getTime() + 60 * 24 * 60 * 60 * 1000),
      dataFimVigencia: umAnoFrente,
      processoSPD: 'SPD-2024-00123',
      area: 'Educação Infantil',
      secretariaId: secretarias[2].id, // SMED
      orgaoId: orgaos[2].id, // MEC
      programaId: programas[3].id, // PROINFRA
      fonteId: fontes[0].id // Tesouro Nacional
    }
  });

  // Convênio 2 - APROVADO (Pavimentação)
  const conv2 = await prisma.convenio.create({
    data: {
      codigo: 'CONV-2024-002',
      titulo: 'Pavimentação Asfáltica - Av. Principal',
      objeto: 'Pavimentação asfáltica de 5km da Avenida Principal, incluindo drenagem e sinalização.',
      status: 'APROVADO',
      descricao: 'Pavimentação, drenagem e sinalização da Avenida Principal.',
      numeroProposta: 'PROP-2024-00456',
      dataInicioProcesso: hoje,
      modalidadeRepasse: 'CONTRATO_REPASSE',
      numeroTermo: '789012/2024',
      esfera: 'FEDERAL',
      ministerioOrgao: 'Ministério das Cidades',
      valorGlobal: 8500000.00,
      valorRepasse: 7000000.00,
      valorContrapartida: 1500000.00,
      dataAssinatura: hoje,
      dataInicioVigencia: trintaDias,
      dataFimVigencia: doisAnosFrente,
      processoSPD: 'SPD-2024-00456',
      area: 'Infraestrutura Viária',
      secretariaId: secretarias[1].id, // SOI
      orgaoId: orgaos[0].id, // Min. Cidades
      programaId: programas[0].id, // PAC
      fonteId: fontes[1].id // FGTS
    }
  });

  // Convênio 3 - EM EXECUÇÃO (UBS)
  const conv3 = await prisma.convenio.create({
    data: {
      codigo: 'CONV-2024-003',
      titulo: 'Reforma da UBS Central',
      objeto: 'Reforma e ampliação da Unidade Básica de Saúde Central',
      status: 'EM_EXECUCAO',
      descricao: 'Reforma completa da UBS Central, incluindo ampliação da área de atendimento.',
      numeroProposta: 'PROP-2023-00789',
      dataInicioProcesso: new Date(hoje.getFullYear() - 1, 6, 1),
      modalidadeRepasse: 'CONVENIO',
      numeroTermo: '456789/2023',
      esfera: 'FEDERAL',
      ministerioOrgao: 'Ministério da Saúde',
      valorGlobal: 1800000.00,
      valorRepasse: 1500000.00,
      valorContrapartida: 300000.00,
      dataAssinatura: new Date(hoje.getFullYear() - 1, 7, 15),
      dataInicioVigencia: new Date(hoje.getFullYear() - 1, 8, 1),
      dataFimVigencia: new Date(hoje.getFullYear(), 11, 31),
      processoSPD: 'SPD-2023-00789',
      area: 'Saúde',
      secretariaId: secretarias[3].id, // SMS
      orgaoId: orgaos[3].id, // Min. Saúde
      programaId: programas[6].id, // SUS
      fonteId: fontes[0].id // Tesouro Nacional
    }
  });

  // Convênio 4 - RASCUNHO (Habitacional)
  const conv4 = await prisma.convenio.create({
    data: {
      codigo: 'CONV-2024-004',
      titulo: 'Construção de 200 Unidades Habitacionais',
      objeto: 'Construção de conjunto habitacional com 200 unidades',
      status: 'RASCUNHO',
      descricao: 'Projeto habitacional para famílias de baixa renda no bairro Nova Esperança.',
      numeroProposta: 'PROP-2024-01000',
      modalidadeRepasse: 'CONTRATO_REPASSE',
      esfera: 'FEDERAL',
      valorGlobal: 45000000.00,
      valorRepasse: 40000000.00,
      valorContrapartida: 5000000.00,
      area: 'Habitação',
      secretariaId: secretarias[1].id, // SOI
      orgaoId: orgaos[5].id, // Caixa
      programaId: programas[1].id, // MCMV
      fonteId: fontes[1].id // FGTS
    }
  });

  // Convênio 5 - CONCLUIDO (Parque)
  const conv5 = await prisma.convenio.create({
    data: {
      codigo: 'CONV-2023-015',
      titulo: 'Implantação de Parque Linear',
      objeto: 'Criação de parque linear com 2km de extensão',
      status: 'CONCLUIDO',
      descricao: 'Parque linear com ciclovias, áreas de lazer e recuperação de APP.',
      numeroProposta: 'PROP-2022-00333',
      dataInicioProcesso: new Date(hoje.getFullYear() - 2, 3, 1),
      modalidadeRepasse: 'TERMO_FOMENTO',
      numeroTermo: '111222/2022',
      esfera: 'ESTADUAL',
      valorGlobal: 3200000.00,
      valorRepasse: 2800000.00,
      valorContrapartida: 400000.00,
      dataAssinatura: new Date(hoje.getFullYear() - 2, 4, 1),
      dataInicioVigencia: new Date(hoje.getFullYear() - 2, 5, 1),
      dataFimVigencia: new Date(hoje.getFullYear() - 1, 11, 31),
      dataPrestacaoContas: new Date(hoje.getFullYear(), 1, 28),
      area: 'Meio Ambiente',
      secretariaId: secretarias[4].id, // SMMA
      orgaoId: orgaos[7].id, // Sec. Estadual Infra
      fonteId: fontes[4].id // Tesouro Estadual
    }
  });

  // Convênio 6 - EM ANÁLISE
  const conv6 = await prisma.convenio.create({
    data: {
      codigo: 'CONV-2024-006',
      titulo: 'Centro de Capacitação Profissional',
      objeto: 'Construção de centro de capacitação profissional com 10 salas',
      status: 'EM_ANALISE',
      descricao: 'Centro para cursos profissionalizantes e qualificação de mão de obra.',
      numeroProposta: 'PROP-2024-01234',
      modalidadeRepasse: 'CONVENIO',
      esfera: 'FEDERAL',
      valorGlobal: 5500000.00,
      valorRepasse: 5000000.00,
      valorContrapartida: 500000.00,
      area: 'Assistência Social',
      secretariaId: secretarias[5].id, // SMAS
      orgaoId: orgaos[1].id, // MDR
      programaId: programas[4].id, // Novo PAC
      fonteId: fontes[2].id // Emenda Individual
    }
  });

  const convenios = [conv1, conv2, conv3, conv4, conv5, conv6];
  console.log(`   ✅ ${convenios.length} convênios criados`);

  // ==================== NOTAS DE EMPENHO ====================
  console.log('📜 Criando notas de empenho...');
  await prisma.notaEmpenho.createMany({
    data: [
      { numero: 'NE-2024-001', tipo: 'REPASSE', valor: 1000000.00, dataEmissao: umAnoAtras, convenioId: conv1.id },
      { numero: 'NE-2024-002', tipo: 'REPASSE', valor: 500000.00, dataEmissao: new Date(umAnoAtras.getTime() + 60 * 24 * 60 * 60 * 1000), convenioId: conv1.id },
      { numero: 'NE-2024-003', tipo: 'CONTRAPARTIDA', valor: 500000.00, dataEmissao: umAnoAtras, convenioId: conv1.id },
      { numero: 'NE-2024-010', tipo: 'REPASSE', valor: 750000.00, dataEmissao: new Date(hoje.getFullYear() - 1, 8, 1), convenioId: conv3.id },
      { numero: 'NE-2024-011', tipo: 'REPASSE', valor: 750000.00, dataEmissao: new Date(hoje.getFullYear(), 2, 1), convenioId: conv3.id },
      { numero: 'NE-2024-012', tipo: 'CONTRAPARTIDA', valor: 300000.00, dataEmissao: new Date(hoje.getFullYear() - 1, 8, 1), convenioId: conv3.id }
    ]
  });
  console.log('   ✅ 6 notas de empenho criadas');

  // ==================== FICHAS ORÇAMENTÁRIAS ====================
  console.log('📊 Criando fichas orçamentárias...');
  await prisma.fichaOrcamentaria.createMany({
    data: [
      { numero: 'FICHA-100', tipo: 'REPASSE', descricao: 'Obras e Instalações', valor: 2000000.00, convenioId: conv1.id },
      { numero: 'FICHA-101', tipo: 'CONTRAPARTIDA', descricao: 'Contrapartida Municipal', valor: 500000.00, convenioId: conv1.id },
      { numero: 'FICHA-200', tipo: 'REPASSE', descricao: 'Reforma Predial', valor: 1500000.00, convenioId: conv3.id },
      { numero: 'FICHA-201', tipo: 'CONTRAPARTIDA', descricao: 'Contrapartida Municipal', valor: 300000.00, convenioId: conv3.id }
    ]
  });
  console.log('   ✅ 4 fichas orçamentárias criadas');

  // ==================== COMUNICADOS ====================
  console.log('📨 Criando comunicados...');
  await prisma.comunicado.createMany({
    data: [
      {
        protocolo: 'COM-2024-0001',
        assunto: 'Solicitação de Documentação Complementar',
        conteudo: 'Solicitamos o envio de documentação complementar referente ao convênio CONV-2024-001.',
        tipo: 'ENTRADA',
        status: 'RECEBIDO',
        dataRegistro: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        origem: 'Ministério da Educação',
        destino: 'SPD',
        responsavel: 'João Silva',
        convenioId: conv1.id
      },
      {
        protocolo: 'COM-2024-0002',
        assunto: 'Resposta - Documentação Complementar',
        conteudo: 'Segue em anexo a documentação complementar solicitada.',
        tipo: 'SAIDA',
        status: 'ENVIADO',
        dataRegistro: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        origem: 'SPD',
        destino: 'Ministério da Educação',
        responsavel: 'João Silva',
        convenioId: conv1.id
      },
      {
        protocolo: 'COM-2024-0003',
        assunto: 'Notificação de Liberação de Parcela',
        conteudo: 'Informamos que foi liberada a 2ª parcela do repasse referente ao convênio.',
        tipo: 'ENTRADA',
        status: 'PENDENTE',
        dataRegistro: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        origem: 'Caixa Econômica Federal',
        destino: 'Secretaria de Obras',
        responsavel: 'Maria Santos',
        convenioId: conv2.id
      },
      {
        protocolo: 'COM-2024-0004',
        assunto: 'Solicitação de Visita Técnica',
        conteudo: 'Solicitamos agendamento de visita técnica para vistoria da obra.',
        tipo: 'ENTRADA',
        status: 'EM ANDAMENTO',
        dataRegistro: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        origem: 'Ministério da Saúde',
        destino: 'SMS',
        responsavel: 'Dr. Ricardo Gomes',
        convenioId: conv3.id
      }
    ]
  });
  console.log('   ✅ 4 comunicados criados');

  // ==================== EVENTOS DA AGENDA ====================
  console.log('📅 Criando eventos da agenda...');
  await prisma.eventoAgenda.createMany({
    data: [
      {
        titulo: 'Reunião de Acompanhamento - Creche Jardim das Flores',
        descricao: 'Reunião mensal de acompanhamento do andamento da obra',
        tipo: 'REUNIAO',
        dataInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        local: 'Sala de Reuniões SPD',
        responsavel: 'João Silva',
        convenioId: conv1.id
      },
      {
        titulo: 'Vencimento Etapa - Estrutura',
        descricao: 'Prazo final para conclusão da etapa de estrutura',
        tipo: 'VENCIMENTO_ETAPA',
        dataInicio: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        convenioId: conv1.id
      },
      {
        titulo: 'Prestação de Contas Parcial',
        descricao: 'Entrega da prestação de contas parcial do 1º semestre',
        tipo: 'PRESTACAO_CONTAS',
        dataInicio: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        local: 'Online',
        responsavel: 'Maria Santos',
        convenioId: conv3.id
      },
      {
        titulo: 'Visita Técnica - Pavimentação',
        descricao: 'Visita técnica para início das obras de pavimentação',
        tipo: 'OUTROS',
        dataInicio: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        local: 'Av. Principal',
        responsavel: 'Eng. Ana Paula',
        convenioId: conv2.id
      }
    ]
  });
  console.log('   ✅ 4 eventos criados');

  // ==================== EMENDAS PARLAMENTARES ====================
  console.log('📝 Criando emendas parlamentares...');
  await prisma.emendaParlamentar.createMany({
    data: [
      {
        nomeParlamentar: 'Dep. Roberto Silva',
        partido: 'PARTIDO A',
        codigoEmenda: 'EMD-2024-001234',
        funcao: '12 - Educação',
        subfuncao: '365 - Educação Infantil',
        programa: 'PROINFRA',
        valorIndicado: 500000.00,
        anoEmenda: 2024,
        convenioId: conv1.id
      },
      {
        nomeParlamentar: 'Dep. Ana Lucia',
        partido: 'PARTIDO B',
        codigoEmenda: 'EMD-2024-001235',
        funcao: '12 - Educação',
        subfuncao: '365 - Educação Infantil',
        programa: 'PROINFRA',
        valorIndicado: 300000.00,
        anoEmenda: 2024,
        convenioId: conv1.id
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
        convenioId: conv2.id
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
        convenioId: conv3.id
      }
    ]
  });
  console.log('   ✅ 4 emendas parlamentares criadas');

  // ==================== DADOS FINANCEIROS ====================
  console.log('🏦 Criando dados financeiros...');
  await prisma.financeiroContas.createMany({
    data: [
      {
        banco: 'Caixa Econômica Federal',
        agencia: '0001',
        contaBancaria: '123456-7',
        valorLiberadoTotal: 1500000.00,
        saldoRendimentos: 15000.00,
        observacoes: 'Conta específica do convênio',
        convenioId: conv1.id
      },
      {
        banco: 'Caixa Econômica Federal',
        agencia: '0001',
        contaBancaria: '789012-3',
        valorLiberadoTotal: 0,
        convenioId: conv2.id
      },
      {
        banco: 'Banco do Brasil',
        agencia: '1234',
        contaBancaria: '456789-0',
        valorLiberadoTotal: 1500000.00,
        saldoRendimentos: 8500.00,
        convenioId: conv3.id
      }
    ]
  });
  console.log('   ✅ 3 registros financeiros criados');

  // ==================== CONTRATOS DE EXECUÇÃO ====================
  console.log('📃 Criando contratos de execução...');
  const contrato1 = await prisma.contratoExecucao.create({
    data: {
      numProcessoLicitatorio: 'LIC-2024-00123',
      modalidadeLicitacao: 'CONCORRENCIA',
      numeroContrato: 'CTR-2024-001',
      contratadaCnpj: '12.345.678/0001-90',
      contratadaNome: 'Construtora ABC Ltda',
      dataAssinatura: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      dataVigenciaInicio: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      dataVigenciaFim: umAnoFrente,
      dataOIS: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000),
      valorContrato: 2300000.00,
      engenheiroResponsavel: 'Eng. Paulo Roberto',
      creaEngenheiro: 'CREA-SP 123456',
      artRrt: 'ART-2024-001234',
      situacao: 'EM EXECUÇÃO',
      prazoExecucaoDias: 365,
      convenioId: conv1.id
    }
  });

  const contrato2 = await prisma.contratoExecucao.create({
    data: {
      numProcessoLicitatorio: 'LIC-2023-00456',
      modalidadeLicitacao: 'TOMADA_PRECOS',
      numeroContrato: 'CTR-2023-015',
      contratadaCnpj: '98.765.432/0001-10',
      contratadaNome: 'Reformas & Cia Ltda',
      dataAssinatura: new Date(hoje.getFullYear() - 1, 8, 1),
      dataVigenciaInicio: new Date(hoje.getFullYear() - 1, 8, 15),
      dataVigenciaFim: new Date(hoje.getFullYear(), 8, 15),
      dataOIS: new Date(hoje.getFullYear() - 1, 8, 20),
      valorContrato: 1650000.00,
      engenheiroResponsavel: 'Eng. Carla Souza',
      creaEngenheiro: 'CREA-SP 654321',
      artRrt: 'ART-2023-005678',
      situacao: 'EM EXECUÇÃO',
      prazoExecucaoDias: 300,
      convenioId: conv3.id
    }
  });
  console.log('   ✅ 2 contratos criados');

  // ==================== MEDIÇÕES ====================
  console.log('📐 Criando medições...');
  await prisma.medicao.createMany({
    data: [
      // Medições do Contrato 1 (Creche)
      {
        numeroMedicao: 1,
        dataMedicao: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        percentualFisico: 15.00,
        valorMedido: 345000.00,
        dataPagamento: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        valorPago: 345000.00,
        situacao: 'PAGA',
        processoMedicao: 'MED-2024-001',
        contratoId: contrato1.id
      },
      {
        numeroMedicao: 2,
        dataMedicao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        percentualFisico: 30.00,
        valorMedido: 345000.00,
        dataPagamento: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        valorPago: 345000.00,
        situacao: 'PAGA',
        processoMedicao: 'MED-2024-002',
        contratoId: contrato1.id
      },
      {
        numeroMedicao: 3,
        dataMedicao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        percentualFisico: 40.00,
        valorMedido: 230000.00,
        situacao: 'EM ANÁLISE',
        observacoes: 'Aguardando aprovação do fiscal',
        processoMedicao: 'MED-2024-003',
        contratoId: contrato1.id
      },
      // Medições do Contrato 2 (UBS)
      {
        numeroMedicao: 1,
        dataMedicao: new Date(hoje.getFullYear() - 1, 10, 1),
        percentualFisico: 40.00,
        valorMedido: 660000.00,
        dataPagamento: new Date(hoje.getFullYear() - 1, 10, 20),
        valorPago: 660000.00,
        situacao: 'PAGA',
        contratoId: contrato2.id
      },
      {
        numeroMedicao: 2,
        dataMedicao: new Date(hoje.getFullYear(), 1, 1),
        percentualFisico: 80.00,
        valorMedido: 660000.00,
        dataPagamento: new Date(hoje.getFullYear(), 1, 25),
        valorPago: 660000.00,
        situacao: 'PAGA',
        contratoId: contrato2.id
      }
    ]
  });
  console.log('   ✅ 5 medições criadas');

  // ==================== PENDÊNCIAS ====================
  console.log('⚠️ Criando pendências...');
  await prisma.pendencia.createMany({
    data: [
      {
        descricao: 'Regularizar ART junto ao CREA',
        responsavel: 'Eng. Paulo Roberto',
        prazo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'ABERTA',
        prioridade: 1,
        orgaoResponsavel: 'CREA-SP',
        convenioId: conv1.id,
        criadoPorId: analista.id
      },
      {
        descricao: 'Enviar relatório fotográfico da medição 3',
        responsavel: 'Fiscal João',
        prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'EM_ANDAMENTO',
        prioridade: 2,
        convenioId: conv1.id,
        criadoPorId: analista.id
      },
      {
        descricao: 'Obter licença ambiental para início das obras',
        responsavel: 'SMMA',
        prazo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'ABERTA',
        prioridade: 1,
        orgaoResponsavel: 'CETESB',
        convenioId: conv2.id,
        criadoPorId: admin.id
      },
      {
        descricao: 'Atualizar cronograma físico-financeiro',
        responsavel: 'Maria Santos',
        prazo: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'RESOLVIDA',
        prioridade: 2,
        resolucao: 'Cronograma atualizado e enviado ao órgão concedente',
        dataResolucao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        convenioId: conv3.id,
        criadoPorId: analista.id
      },
      {
        descricao: 'Solicitar prorrogação de vigência',
        responsavel: 'João Silva',
        prazo: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'ABERTA',
        prioridade: 1,
        orgaoResponsavel: 'MEC',
        convenioId: conv1.id,
        criadoPorId: admin.id
      }
    ]
  });
  console.log('   ✅ 5 pendências criadas');

  // ==================== ADITIVOS ====================
  console.log('➕ Criando aditivos...');
  await prisma.aditivo.createMany({
    data: [
      {
        numeroAditivo: 1,
        tipoAditivo: 'PRAZO',
        dataAssinatura: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        novaVigencia: new Date(umAnoFrente.getTime() + 180 * 24 * 60 * 60 * 1000),
        motivo: 'Atraso nas obras devido a período chuvoso',
        justificativa: 'Conforme relatório técnico, as chuvas intensas dos meses de janeiro e fevereiro impossibilitaram a continuidade das obras de fundação.',
        convenioId: conv1.id
      },
      {
        numeroAditivo: 1,
        tipoAditivo: 'VALOR',
        dataAssinatura: new Date(hoje.getFullYear(), 2, 15),
        valorAcrescimo: 150000.00,
        motivo: 'Acréscimo de serviços',
        justificativa: 'Necessidade de adequação do projeto às novas normas de acessibilidade NBR 9050:2024.',
        convenioId: conv3.id
      }
    ]
  });
  console.log('   ✅ 2 aditivos criados');

  // ==================== RESUMO ====================
  await prisma.$disconnect();

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo dos dados criados:');
  console.log('   ├─ Usuários: 4');
  console.log(`   ├─ Secretarias: ${secretarias.length}`);
  console.log(`   ├─ Órgãos Concedentes: ${orgaos.length}`);
  console.log(`   ├─ Programas: ${programas.length}`);
  console.log(`   ├─ Fontes de Recurso: ${fontes.length}`);
  console.log(`   ├─ Convênios: ${convenios.length}`);
  console.log('   ├─ Notas de Empenho: 6');
  console.log('   ├─ Fichas Orçamentárias: 4');
  console.log('   ├─ Comunicados: 4');
  console.log('   ├─ Eventos: 4');
  console.log('   ├─ Emendas Parlamentares: 4');
  console.log('   ├─ Financeiros: 3');
  console.log('   ├─ Contratos: 2');
  console.log('   ├─ Medições: 5');
  console.log('   ├─ Pendências: 5');
  console.log('   └─ Aditivos: 2');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   ├─ Admin: admin@spd.gov.br / admin123');
  console.log('   └─ Analista: joao.silva@spd.gov.br / analista123');
}

seed().catch((error) => {
  console.error('❌ Erro no seed:', error);
  process.exit(1);
});
