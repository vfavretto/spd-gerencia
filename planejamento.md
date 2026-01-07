# Planejamento de Produção - SPD Gerência

**Sistema de Gerenciamento Interno da Secretaria de Planejamento e Desenvolvimento**

---

## Informações Gerais

| Item | Descrição |
|------|-----------|
| **Contexto** | Aplicação interna da prefeitura |
| **Acesso** | Restrito à intranet |
| **Prazo estimado** | 1-2 meses |
| **Manutenção** | Desenvolvedor interno |
| **Infraestrutura** | Equipe de TI da Prefeitura |

---

## Cronograma Resumido

| Semana | Foco Principal |
|--------|----------------|
| 1-2 | Testes do Sistema |
| 3-4 | Segurança do Código |
| 5-6 | Monitoramento + Documentação |
| 7-8 | Infraestrutura (TI) + Go-Live |

---

## Fase 1: Testes do Sistema (Semana 1-2)

### 1.1 Configuração do Ambiente de Testes

- [ ] Instalar Jest e Supertest para testes da API
- [ ] Instalar Playwright para testes E2E do frontend
- [ ] Criar arquivos de configuração (`jest.config.js`, `playwright.config.ts`)
- [ ] Adicionar scripts de teste no `package.json`
- [ ] Configurar banco de dados de teste separado

### 1.2 Testes Unitários (Backend)

| Módulo | Prioridade | Status |
|--------|------------|--------|
| Auth (Login/Logout/Token) | Alta | ⬜ |
| Convênios (CRUD completo) | Alta | ⬜ |
| Comunicados (CRUD) | Média | ⬜ |
| Agenda/Eventos | Média | ⬜ |
| Financeiro (Contas) | Média | ⬜ |
| Aditivos | Média | ⬜ |
| Medições | Baixa | ⬜ |
| Pendências | Baixa | ⬜ |

### 1.3 Testes de Integração (Rotas da API)

- [ ] Testar todas as rotas protegidas (retornar 401 sem token)
- [ ] Testar fluxo completo de autenticação
- [ ] Testar CRUD de convênios via API
- [ ] Testar CRUD de comunicados via API
- [ ] Testar filtros e paginação
- [ ] Testar validações de dados (Zod)

### 1.4 Testes E2E (Frontend)

| Fluxo | Prioridade | Status |
|-------|------------|--------|
| Login/Logout | Alta | ⬜ |
| Cadastro de convênio | Alta | ⬜ |
| Edição de convênio | Alta | ⬜ |
| Listagem com filtros | Média | ⬜ |
| Cadastro de comunicado | Média | ⬜ |
| Navegação geral | Baixa | ⬜ |

### 1.5 Meta de Cobertura

- Cobertura mínima: **60%**
- Foco em: Use Cases e Controllers

---

## Fase 2: Segurança (Semana 3-4)

### 2.1 Rate Limiting

- [ ] Instalar `express-rate-limit`
- [ ] Configurar limiter geral (100 req/15min por IP)
- [ ] Configurar limiter de login (5 tentativas/15min)
- [ ] Testar se está funcionando corretamente

### 2.2 Logs de Auditoria

- [ ] Criar modelo `AuditLog` no banco de dados
- [ ] Criar middleware de auditoria
- [ ] Registrar ações: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- [ ] Armazenar: usuário, IP, data/hora, recurso afetado
- [ ] Criar endpoint para consultar logs (apenas admin)

### 2.3 Revisão de Segurança

- [ ] Verificar se todas as rotas sensíveis exigem autenticação
- [ ] Revisar configuração do CORS para produção
- [ ] Confirmar que Helmet está ativo
- [ ] Verificar se JWT_SECRET será forte em produção (256 bits)
- [ ] Garantir que senhas são hasheadas com bcrypt
- [ ] Remover console.logs sensíveis
- [ ] Validar todos os inputs com Zod

### 2.4 Variáveis de Ambiente

- [ ] Criar `.env.production` de exemplo
- [ ] Documentar todas as variáveis necessárias:
  - `NODE_ENV`
  - `PORT`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
- [ ] Garantir que `.env` está no `.gitignore`

### 2.5 Limpeza de Dados de Desenvolvimento

- [ ] Remover ou atualizar usuários de seed
- [ ] Criar script para gerar usuário admin com senha segura
- [ ] Remover dados fictícios de convênios/comunicados

---

## Fase 3: Monitoramento (Semana 5)

### 3.1 Health Check

- [ ] Melhorar endpoint `/api/health` para incluir:
  - Status do MongoDB
  - Uptime do servidor
  - Versão da aplicação
  - Uso de memória

### 3.2 Logs de Aplicação

- [ ] Configurar logs estruturados para produção
- [ ] Definir níveis de log (error, warn, info)
- [ ] Desativar morgan detalhado em produção
- [ ] Definir onde logs serão armazenados

### 3.3 Alertas Básicos

- [ ] Documentar como verificar se sistema está no ar
- [ ] Criar script simples de verificação de saúde
- [ ] Definir procedimento em caso de queda

---

## Fase 4: Documentação (Semana 5-6)

### 4.1 Documentação Técnica

| Documento | Descrição | Status |
|-----------|-----------|--------|
| README.md | Atualizar com info de produção | ⬜ |
| DEPLOY.md | Passo a passo de deploy | ⬜ |
| BACKUP.md | Procedimento de backup/restore | ⬜ |
| API.md | Documentação dos endpoints | ⬜ |

### 4.2 Manual do Usuário

- [ ] Criar guia básico de uso do sistema
- [ ] Documentar funcionalidades principais:
  - Login e perfis de acesso
  - Cadastro de convênios
  - Registro de comunicados
  - Uso do calendário
  - Dashboard e indicadores
- [ ] Incluir capturas de tela

### 4.3 Documentação de Operação

- [ ] Credenciais e acessos (guardar em local seguro)
- [ ] Comandos úteis de manutenção
- [ ] Procedimento de atualização
- [ ] Contatos de suporte

---

## Fase 5: Homologação (Semana 6)

### 5.1 Ambiente de Homologação

- [ ] Fazer deploy em ambiente de teste
- [ ] Configurar com dados reais (ou cópia)
- [ ] Liberar acesso para usuários-chave

### 5.2 Testes de Aceite

- [ ] Agendar sessões de teste com usuários do setor
- [ ] Coletar feedback e bugs encontrados
- [ ] Priorizar correções
- [ ] Realizar correções necessárias
- [ ] Repetir testes se necessário

### 5.3 Treinamento

- [ ] Agendar treinamento com usuários finais
- [ ] Preparar material de apoio
- [ ] Responder dúvidas
- [ ] Coletar sugestões de melhoria (para versões futuras)

---

## Fase 6: Infraestrutura - TI da Prefeitura (Semana 7-8)

> **Responsabilidade:** Equipe de TI da Prefeitura

### 6.1 Servidor

- [ ] Provisionar servidor (físico ou VM)
- [ ] Instalar Ubuntu Server 22.04 LTS
- [ ] Configurar rede na intranet
- [ ] Definir IP fixo ou hostname interno
- [ ] Configurar firewall (liberar apenas portas necessárias)

### 6.2 Software Base

- [ ] Instalar Node.js 20 LTS
- [ ] Instalar MongoDB 7
- [ ] Instalar NGINX
- [ ] Instalar PM2 (gerenciador de processos)
- [ ] Instalar Git

### 6.3 Certificado SSL

- [ ] Gerar certificado autoassinado para intranet
- [ ] Configurar NGINX com HTTPS
- [ ] Testar acesso via HTTPS

### 6.4 Deploy da Aplicação

- [ ] Clonar repositório no servidor
- [ ] Instalar dependências
- [ ] Compilar aplicação
- [ ] Configurar variáveis de ambiente
- [ ] Iniciar com PM2
- [ ] Configurar início automático

### 6.5 Backup

- [ ] Criar script de backup do MongoDB
- [ ] Agendar backup diário (cron)
- [ ] Definir local de backup externo (HD/NAS)
- [ ] Testar procedimento de restauração

### 6.6 DNS Interno

- [ ] Definir nome do sistema (ex: `spd.prefeitura.local`)
- [ ] Configurar DNS interno ou arquivo hosts

---

## Checklist Final Pré-Produção

### Código
- [ ] Todos os testes passando
- [ ] Cobertura mínima de 60%
- [ ] Rate limiting ativo
- [ ] Logs de auditoria funcionando
- [ ] Sem console.logs desnecessários

### Segurança
- [ ] JWT_SECRET forte configurado
- [ ] CORS restrito ao domínio interno
- [ ] Helmet ativo
- [ ] Senhas de usuários fortes

### Dados
- [ ] Dados de seed/teste removidos
- [ ] Usuário admin com senha segura criado
- [ ] Backup inicial realizado

### Documentação
- [ ] Manual do usuário disponível
- [ ] Documentação técnica atualizada
- [ ] Procedimentos de operação documentados

### Validação
- [ ] Testes de homologação concluídos
- [ ] Bugs críticos corrigidos
- [ ] Usuários treinados
- [ ] Aprovação do gestor obtida

---

## Contatos

| Função | Nome | Contato |
|--------|------|---------|
| Desenvolvedor | [Preencher] | [Preencher] |
| Gestor do Setor | [Preencher] | [Preencher] |
| TI da Prefeitura | [Preencher] | [Preencher] |

---

## Próximos Passos Após Produção

1. Implementar relatórios exportáveis (PDF/Excel)
2. Adicionar integração com armazenamento de documentos
3. Implementar notificações por email
4. Avaliar necessidade de acesso remoto (VPN)
5. Coletar feedback para melhorias contínuas

---

*Secretaria de Planejamento e Desenvolvimento - Prefeitura de Votorantim*
*Documento atualizado em: Janeiro/2026*