This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Controle de acesso

Defina a variável de ambiente `OWNER_EMAILS` (ou `NEXT_PUBLIC_OWNER_EMAILS`) com uma lista separada por vírgula dos e-mails que devem ser promovidos automaticamente para o papel de proprietário ao fazer login. Exemplo:

```bash
OWNER_EMAILS=owner@exemplo.com,outro.owner@exemplo.com
```

Esses usuários terão acesso imediato ao painel administrativo para gerenciar demais membros.

## Banco de dados

O diretório `supabase/migrations` contém o script `20240212000000_app_schema.sql` com toda a estrutura necessária para o RBAC, clientes, mídias e automações usadas pelo painel.

1. Importe o arquivo direto no Supabase ou execute no seu banco PostgreSQL autenticado como `postgres` (role com permissão para definir políticas):

   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/migrations/20240212000000_app_schema.sql
   ```

2. Ajuste a variável `OWNER_EMAILS` no `.env.local` para promover automaticamente o(s) responsável(is) pela conta.

3. Crie um bucket público chamado `media` no Supabase Storage para armazenar os arquivos enviados pelo módulo de mídias.
