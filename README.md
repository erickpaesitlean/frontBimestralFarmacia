# Sistema de Gestão de Farmácia (Frontend)

Frontend em **React + TypeScript (Vite)** que consome a API do **backend Spring Boot**.

## Como executar

### Requisitos

- **Node.js** (LTS recomendado) + **npm**
- **Backend Spring Boot** rodando (padrão: `http://localhost:8080`)

### 1) Instalar dependências

```bash
npm install
```

### 2) Configurar URL do backend

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3) Subir o frontend

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## Conexão com o backend (Spring Boot)

- **Base URL**: definida em `VITE_API_BASE_URL`
- **CORS**: o backend deve permitir origem do front (`http://localhost:5173`)
- **Autenticação**: HTTP Basic (conforme implementado no backend)

Se aparecer erro de conexão no login, verifique:

- backend está rodando e acessível em `http://localhost:8080`
- CORS liberado para `http://localhost:5173`
- `.env` configurado corretamente (reinicie o `npm run dev` após alterar)

## Scripts úteis

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Notas rápidas

- **Estoque (edição de medicamento)**: a “quantidade” no modo edição é tratada como **entrada adicional** (use `0` para não adicionar).

## Documentação do backend

- Requisitos/Endpoints: `REQUISITOS_BACKEND_FARMACIA.md`
