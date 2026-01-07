# 💊 Sistema de Gestão de Farmácia - Frontend

Frontend profissional desenvolvido em **React 18 + TypeScript + Vite** para gerenciamento completo de uma farmácia, integrado com API REST Spring Boot.

## 🚀 Tecnologias

- **React 18.3** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **React Hook Form + Zod** - Formulários e validação
- **TailwindCSS** - Estilização
- **Context API** - Gerenciamento de estado (Auth)
- **ESLint + Prettier** - Linting e formatação

## 📋 Funcionalidades

### ✅ Categorias
- CRUD completo
- Validação de campos
- Tratamento de erros

### ✅ Clientes
- CRUD completo
- Validação de CPF (máscara)
- Validação de idade mínima (18 anos)
- Validação de e-mail

### ✅ Medicamentos
- CRUD completo
- Ativar/Inativar medicamentos
- Exclusão lógica
- **Edição com entrada adicional de estoque** (campo explícito)
- Histórico de movimentações de estoque

### ✅ Estoque
- Registrar entrada de estoque
- Registrar saída de estoque
- Histórico por medicamento

### ✅ Vendas
- Criar venda com múltiplos itens
- Listar todas as vendas
- Filtrar vendas por cliente
- Visualizar detalhes da venda
- Validação de estoque e validade

### ✅ Alertas
- Medicamentos com estoque baixo (configurável)
- Medicamentos com validade próxima (configurável)

## 🔐 Autenticação

- **HTTP Basic Authentication**
- Token armazenado apenas em memória (sessionStorage)
- Interceptor Axios para injetar credenciais
- Redirecionamento automático em 401

## 🏗️ Arquitetura

```
src/
├── api/              # Configuração Axios e tipos
├── auth/             # Context de autenticação
├── components/       # Componentes reutilizáveis
│   ├── toast/       # Sistema de notificações
│   └── ui/          # Button, Input, Modal, etc
├── features/         # Features por domínio
│   ├── categorias/
│   ├── clientes/
│   ├── medicamentos/
│   ├── estoque/
│   ├── vendas/
│   └── alertas/
├── layouts/          # Layouts (Auth, App)
├── lib/              # Utilitários (máscaras, formatação)
├── pages/            # Páginas principais
└── routes/           # Configuração de rotas
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- Backend Spring Boot rodando (ver [REQUISITOS_BACKEND_FARMACIA.md](./REQUISITOS_BACKEND_FARMACIA.md))

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure a variável de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Ou use a URL de produção:

```env
VITE_API_BASE_URL=https://bimestraljava-production.up.railway.app
```

4. Execute o projeto:

```bash
npm run dev
```

5. Acesse `http://localhost:5173`

### Credenciais de Teste

**Produção:**
- Usuário: `kekejava`
- Senha: `keke059p`

**Local (se configurado):**
- Usuário: `admin`
- Senha: `123456`

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos estarão em `dist/`

## 🧪 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa ESLint
- `npm run preview` - Preview do build de produção

## 🎨 Características de UX

- ✅ Máscaras para CPF e valores monetários
- ✅ Datas formatadas em pt-BR
- ✅ Modal de confirmação para exclusões
- ✅ Toasts para feedback (sucesso/erro)
- ✅ Loading states em todas as operações
- ✅ Tratamento de erros por campo (400)
- ✅ Mensagens amigáveis para 404/500
- ✅ Design responsivo e moderno

## ⚠️ Tratamento de Erros

- **400 (Validation Failed)**: Mostra erros por campo
- **401 (Unauthorized)**: Logout automático e redirecionamento
- **404 (Not Found)**: Mensagem amigável
- **500 (Internal Server Error)**: Toast genérico de erro

## 📝 Notas Importantes

### Medicamentos - Edição de Estoque

⚠️ **ATENÇÃO**: Ao editar um medicamento, o campo "Quantidade de Estoque" é tratado como uma **ENTRADA ADICIONAL** ao estoque atual, não como substituição. Use `0` se não quiser adicionar estoque.

### Vendas

- Cliente deve ter 18 anos ou mais
- Medicamento deve estar ativo
- Medicamento não pode estar vencido
- Estoque deve ser suficiente
- Quantidade deve ser maior que zero

## 🔗 Integração com Backend

Este frontend consome a API documentada em [REQUISITOS_BACKEND_FARMACIA.md](./REQUISITOS_BACKEND_FARMACIA.md).

Todas as requisições são autenticadas via HTTP Basic Auth, com token gerado a partir das credenciais do usuário.

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.
