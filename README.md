# ReconheceAI - Plataforma Inteligente de Gestão de Talentos

Uma plataforma avançada de gestão de talentos e recursos humanos, powered by IA generativa.

## 🚀 Funcionalidades Principais

### 📊 Dashboard Executivo
- Métricas em tempo real de colaboradores
- Insights automáticos gerados por IA
- Visualizações interativas e responsivas
- Alertas críticos e notificações

### 👥 Gestão de Colaboradores
- Perfis detalhados com scores de reconhecimento
- Análise de risco de perda e retenção
- Histórico de performance e avaliações
- Identificação de top performers

### 🧠 Análises com IA Generativa
- **Análise de Risco**: Estratégias personalizadas de retenção
- **Análise de Impacto**: Avaliação do impacto da perda de colaboradores
- **Planos de Reconhecimento**: Estratégias de valorização personalizadas
- **Planos de Desenvolvimento**: Trilhas de crescimento individualizadas
- **Análise de Diversidade**: Métricas e oportunidades de D&I

### 💬 Chat com IA
- Assistente inteligente especializado em RH
- Respostas contextuais sobre colaboradores
- Sugestões de ações baseadas em dados
- Interface conversacional intuitiva

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Recharts** para visualizações
- **Zustand** para gerenciamento de estado
- **React Router** para navegação
- **Lucide React** para ícones

### Backend & Banco de Dados
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Row Level Security (RLS)** para segurança
- **Triggers e Functions** para automação
- **Índices otimizados** para performance

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd reconheceai

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase
```

### Executar em Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📊 Estrutura dos Dados

O projeto já está configurado com um banco Supabase funcional que inclui:
- Estrutura completa das tabelas
- Dados de exemplo (30 colaboradores)
- Políticas de segurança (RLS)
- Índices otimizados
- Triggers automáticos

## 🎯 Funcionalidades de IA

### Chat Inteligente
- Respostas contextuais sobre RH
- Análises de colaboradores específicos
- Sugestões de ações baseadas em dados
- Interface conversacional natural

### Análises Generativas
- **Análise de Risco**: Diagnóstico + Plano de retenção
- **Análise de Impacto**: Avaliação do impacto organizacional
- **Reconhecimento**: Estratégias personalizadas de valorização
- **Desenvolvimento**: Trilhas de crescimento individuais
- **Diversidade**: Oportunidades de inclusão

## 🔒 Segurança

- **Row Level Security (RLS)** no Supabase
- **Autenticação** integrada
- **Políticas de acesso** granulares
- **Validação** de dados no frontend e backend
- **Sanitização** de inputs

## 📱 Responsividade

- Design mobile-first
- Breakpoints otimizados
- Componentes adaptativos
- Navegação touch-friendly

## 🚀 Deploy

O projeto está preparado para deploy em:
- **Vercel** (recomendado para frontend)
- **Netlify**
- **Supabase** (backend já hospedado)

## 📄 Licença

Projeto desenvolvido para fins educacionais e de demonstração.

---

**ReconheceAI** - Transformando a gestão de talentos com inteligência artificial 🚀