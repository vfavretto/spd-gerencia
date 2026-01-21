# 📋 Plano de Ação: SPD Gerência (Migração Excel -> Sistema)

Este documento descreve o roteiro para refatorar o projeto `spd-gerencia`, migrando o banco de dados para MySQL e implementando as funcionalidades necessárias para substituir a planilha de controle "Convênios_apartir2021.xlsx".

## 🚀 Fase 1: Arquitetura e Banco de Dados (MySQL)

O objetivo desta fase é garantir a integridade relacional dos dados que hoje estão soltos na planilha.

- [x] **Configuração do Ambiente**
    - [x] Subir container Docker com MySQL 8.0+.
    - [x] Configurar variáveis de ambiente (`DATABASE_URL`) no `.env`.
    - [x] Instalar Prisma ORM (ou TypeORM) para gerenciar o schema e migrações.
        ```bash
        npm install prisma --save-dev
        npm install @prisma/client
        npx prisma init
        ```

- [x] **Modelagem do Banco de Dados (Schema)**
    - [x] Criar tabela `Convenios` (Dados base, objeto, prazos, status).
    - [x] Criar tabela `FontesRecurso` (Federal, Estadual, Financiamento).
    - [x] Criar tabela `Financeiro` (Relacionamento 1:N com Convênio).
        - *Campos cruciais:* `ficha_orcamentaria`, `nota_empenho`, `data_emissao`, `valor`, `tipo` (RP, CP, Exclusiva).
    - [x] Criar tabela `Contratos` (Relacionamento 1:N com Convênio).
    - [x] Criar tabela `Medicoes` (Relacionamento 1:N com Contrato).
    - [x] Criar tabela `Aditivos` (Vigência e Valor).
    - [x] Criar tabela `HistoricoStatus` (Para auditoria de mudanças de fase).

- [x] **Refatoração da Camada de Dados (Repositories)**
    - [x] Criar implementação `MysqlConvenioRepository` (substituindo Mongoose).
    - [x] Criar implementação `MysqlFinanceiroRepository`.
    - [x] Criar implementação `MysqlMedicaoRepository`.
    - [x] Atualizar injeção de dependência no `server.ts` ou container DI para usar os repositórios MySQL.

## ⚙️ Fase 2: Backend e Regras de Negócio

Implementação da lógica que o Excel não consegue fazer ou faz manualmente.

- [] **Máquina de Estados (Status Flow)**
    - [ ] Implementar validação de transição de status.
        - *Ex:* Impedir mudança para "Concluído" se houver saldo pendente ou prestação de contas aberta.
    - [x] Mapear as abas do Excel ("Em Análise", "Em Andamento", "Suspensiva") para status no banco.

- [x] **Módulo Financeiro Avançado**
    - [x] Implementar cálculo de saldo automático (Backend deve somar Empenhos - Medições Pagas).
    - [x] Criar validação para não permitir medição maior que o saldo do contrato.

- [ ] **Serviço de Monitoramento (Cron Jobs)**
    - [ ] Instalar `node-cron` ou configurar filas (BullMQ).
    - [ ] Criar Job diário para verificar "Vigência" (Alertar 90, 60, 30 dias antes).
    - [ ] Criar Job para calcular a coluna "Dias sem movimentação" e atualizar flag no banco.

- [ ] **API de Dashboard (Substituir aba "Controle SPD")**
    - [ ] Criar endpoint `GET /dashboard/resumo-financeiro`.
    - [ ] Implementar queries com `GROUP BY` e `SUM` para retornar:
        - Total por Esfera (Estadual/Federal).
        - Total por Situação.
        - Valores Totais Repassados vs. Contrapartida.

## 💻 Fase 3: Frontend e UX

Melhorar a apresentação para lidar com a densidade de dados do Excel.

- [ ] **Formulários e Cadastro**
    - [ ] Melhorar inputs de moeda (R$) para evitar erros de digitação.

- [ ] **Indicadores Visuais**
    - [x] Implementar Badges coloridas condicionais na tabela:
        - *Vermelho:* Prazos vencendo ou "Dias sem movimentação" > 30.
        - *Verde:* Concluídos.
        - *Amarelo:* Em análise/Pendências.

## 📦 Fase 4: Migração e Finalização

"Matar" a planilha antiga.

- [ ] **Script de Importação (Seed)**
    - [ ] Criar script (`scripts/import_excel.ts`) usando biblioteca `xlsx` ou `csv-parser`.
    - [ ] Mapear colunas do CSV atual para as novas tabelas do MySQL.
    - [ ] Executar carga inicial de dados.

- [ ] **Validação**
    - [ ] Gerar relatório no sistema e comparar totais com a aba "Controle SPD" do Excel.
    - [ ] Validar se todos os convênios ativos foram importados corretamente.

- [ ] **Deployment**
    - [ ] Atualizar pipeline de CI/CD para rodar migrations do MySQL.
    - [ ] Provisionar banco MySQL em produção.
