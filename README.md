# MyGest

MyGest é um painel SaaS para social media construído com Next.js 15, React 19 e Supabase. Ele concentra dashboards operacionais, CRM de clientes, agenda editorial e biblioteca de mídia, tudo com sincronização em tempo real e estado global via Zustand.

## Sumário

- [Arquitetura](#arquitetura)
- [Scripts disponíveis](#scripts-disponíveis)
- [Configuração de ambiente](#configuração-de-ambiente)
- [Fluxo de autenticação](#fluxo-de-autenticação)
- [Padrões de código](#padrões-de-código)
- [Testes](#testes)
- [Estratégia de deploy](#estratégia-de-deploy)

## Arquitetura

A estrutura do projeto segue camadas separadas para UI, domínio e acesso a dados.

```
src/
  app/                # Rotas, layouts e server actions
  components/
    shared/           # Layouts, providers e componentes reutilizáveis
    ui/               # Componentes de UI genéricos (Radix + Tailwind)
  config/             # Configurações e helpers de ambiente
  features/           # Módulos de negócio (clients, media, admin, auth...)
  hooks/              # Hooks reutilizáveis (realtime, tema, etc.)
  lib/                # Bibliotecas globais (Supabase client, utilidades)
  services/
    auth/             # Casos de uso relacionados a sessão e RBAC
    repositories/     # Acesso ao Supabase organizado por domínio
  store/              # Estado global (Zustand)
  types/              # Tipos compartilhados (Supabase, tabelas)
```

- **Supabase**: centralizado em `src/lib/supabase`, com helpers separados para browser (`browser.ts`), Server Components e Route Handlers (`server.ts`). As credenciais são resolvidas via `src/config/env.ts`.
- **Repositories**: todo acesso ao banco passa por `src/services/repositories`, garantindo isolamento entre UI e dados.
- **Features**: cada módulo de negócio encapsula seus componentes especializados em `src/features/<feature>/`.

## Scripts disponíveis

No `package.json` você encontra os seguintes scripts:

| Script               | Descrição                                           |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Inicia o servidor Next.js em modo desenvolvimento   |
| `npm run build`      | Gera o build de produção                            |
| `npm run start`      | Executa o build de produção                         |
| `npm run lint`       | Executa o ESLint em todo o projeto                  |
| `npm run type-check` | Executa o TypeScript no modo `--noEmit`             |
| `npm run format`     | Formata os arquivos com Prettier                    |
| `npm run test`       | Executa a suíte de testes com Jest e gera cobertura |

## Configuração de ambiente

Copie `.env.example` para `.env.local` e preencha as variáveis abaixo:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<chave-anonima>"
SUPABASE_SERVICE_ROLE_KEY="<chave-service-role>" # requerido para ações server-side
NEXT_PUBLIC_SITE_URL="http://localhost:3000" # opcional, usado para callbacks
```

Outras variáveis úteis:

- `OWNER_EMAILS`: lista separada por vírgula de e-mails com permissão para assumir o papel `owner` durante o onboarding.

## Fluxo de autenticação

1. O login é feito via OAuth Google usando o helper `createSupabaseBrowserClient` no client.
2. O callback `/auth/callback` sincroniza a sessão no servidor, garante que a organização exista e redireciona o usuário para o onboarding ou dashboard.
3. O middleware e o layout autenticado (`src/app/(app)/layout.tsx`) validam sessão e organização antes de renderizar o shell do app.
4. Estado global (usuário, organização e tabelas sincronizadas) fica em `src/store/appStore.ts` com persistência em tempo real via `useRealtimeSync`.

## Padrões de código

- **TypeScript estrito** com utilidades centralizadas em `src/lib/utils`.
- **Validação** com [Zod](https://zod.dev) para server actions críticas (`createClientAction`).
- **Supabase** com separação clara entre browser e server, evitando múltiplas instâncias.
- **Arquitetura limpa**: UI -> features -> services -> repositories.
- **Prettier + ESLint** garantindo estilo consistente.

## Testes

Os testes utilizam [Jest](https://jestjs.io/) com ambiente `jsdom`, mocks automáticos e metas de cobertura configuradas via `jest.config.ts`. Os arquivos de teste ficam em `tests/`.

Para executar localmente:

```bash
npm run test
```

## Estratégia de deploy

- **Build**: `npm run build`
- **Hospedagem**: configurado para deploy na Vercel (Next.js 15).
- **Banco de dados**: Supabase com RLS. O script `supabase/migrations/20240212000000_app_schema.sql` descreve as tabelas utilizadas.
- **Variáveis**: configure as variáveis do Supabase e URLs de callback diretamente no painel da Vercel.

Para produção, habilite HTTPS, revise políticas de Storage e confirme que as regras de RLS contemplam apenas usuários autenticados e da mesma organização.
