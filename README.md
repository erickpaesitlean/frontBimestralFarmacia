# 💊 Sistema de Gestão de Farmácia

Frontend desenvolvido em **React + TypeScript** para gerenciamento completo de farmácia.

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

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env`:

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

Integrado com API Spring Boot. Ver [REQUISITOS_BACKEND_FARMACIA.md](./REQUISITOS_BACKEND_FARMACIA.md)
