# 💊 Sistema de Gestão de Farmácia - Frontend

Frontend desenvolvido em **React + TypeScript** para gerenciamento completo de farmácia.

> ⚠️ **Este frontend consome a API REST do backend em Java/Spring Boot construído anteriormente.**

## 🚀 Tecnologias

React 18 • TypeScript • Vite • TailwindCSS • Axios • React Hook Form + Zod

## 📋 Funcionalidades

- **Categorias** - Gerenciamento completo
- **Clientes** - CRUD com validação de CPF e idade (18+)
- **Medicamentos** - CRUD com controle de status e histórico
- **Estoque** - Entrada/saída e movimentações
- **Vendas** - Carrinho com múltiplos itens e validações
- **Alertas** - Estoque baixo e validade próxima

## 🚀 Início Rápido

### Pré-requisitos

✅ **Backend em Java/Spring Boot rodando** (porta 8080)

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` apontando para o backend:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Executar

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### Credenciais

**Produção:**
- Usuário: `kekejava`
- Senha: `keke059p`

## 📦 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificar código
npm run preview  # Preview do build
```

## 📝 Observações

- **Estoque**: Campo de quantidade na edição adiciona ao estoque existente (use `0` para não adicionar)
- **Vendas**: Validação automática de idade, status, validade e estoque
- **Autenticação**: HTTP Basic Auth com token em sessionStorage

## 🔗 Backend

Este frontend é a interface para o **backend em Java/Spring Boot** construído anteriormente.

- **Autenticação**: HTTP Basic Auth
- **Endpoints**: Ver [REQUISITOS_BACKEND_FARMACIA.md](./REQUISITOS_BACKEND_FARMACIA.md)
- **Porta padrão**: 8080
