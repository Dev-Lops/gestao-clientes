import fs from "fs";
import path from "path";

// Caminho pro schema gerado
const schemaPath = path.resolve("src/types/supabase.ts");
const targetFile = path.resolve("src/services/repositories/realtime.ts");

if (!fs.existsSync(schemaPath)) {
  console.error(
    "❌ Arquivo src/types/supabase.ts não encontrado. Rode primeiro o comando de geração do schema.",
  );
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, "utf8");

// Pega todas as tabelas do schema
const matches = schema.match(/app_[a-zA-Z0-9_]+(?=: {)/g) ?? [];

const SELECTS: Record<string, string> = {};
for (const table of matches) {
  // Extrai colunas de cada tabela
  const regex = new RegExp(`${table}: {[^}]*?Row: {([^}]*)}`, "s");
  const block = regex.exec(schema)?.[1];
  if (!block) continue;

  const columns = [...block.matchAll(/(\w+)\?:|(\w+):/g)]
    .map((m) => m[1] || m[2])
    .filter((col) => !["id"].includes(col));

  SELECTS[table] = ["id", ...columns].join(", ");
}

let fileContent = fs.readFileSync(targetFile, "utf8");

// Substitui o bloco SELECTS no realtime.ts
fileContent = fileContent.replace(
  /const SELECTS:[\s\S]*?};/,
  `const SELECTS: Record<SyncedTable, string> = ${JSON.stringify(
    SELECTS,
    null,
    2,
  )
    .replace(/"/g, "")
    .replace(/,/g, ",")
    .replace(/:/g, ": ")};`,
);

fs.writeFileSync(targetFile, fileContent, "utf8");

console.log(
  `✅ SELECTS atualizados com base no schema do Supabase (${matches.length} tabelas).`,
);
