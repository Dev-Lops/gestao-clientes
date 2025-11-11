/**
 * 🔍 Scanner de cookies Supabase
 *
 * Executa uma varredura recursiva no projeto e lista trechos suspeitos que podem
 * causar o erro: "Unexpected token 'b', 'base64-eyJ'... is not valid JSON"
 *
 * Como usar:
 *   1️⃣ Salve este arquivo em scripts/scan-supabase-cookies.ts
 *   2️⃣ Execute: npx tsx scripts/scan-supabase-cookies.ts
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve("src");
const TARGETS = [".ts", ".tsx", ".js", ".jsx"];

interface Finding {
  file: string;
  line: number;
  context: string;
}

const findings: Finding[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    const l = line.trim();

    // Casos mais comuns de leitura errada
    const patterns = [
      /JSON\.parse\(.*cookie/i,
      /JSON\.parse\(.*sb-/i,
      /cookies\(\)\.get\(/i,
      /auth-token/i,
      /document\.cookie/i,
      /base64-eyJ/i,
    ];

    if (patterns.some((r) => r.test(l))) {
      findings.push({
        file: filePath,
        line: i + 1,
        context: l,
      });
    }
  });
}

function walkDir(dir: string) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (TARGETS.some((ext) => fullPath.endsWith(ext))) {
      scanFile(fullPath);
    }
  }
}

console.log(`🔍 Escaneando ${ROOT} ...`);
walkDir(ROOT);

if (findings.length === 0) {
  console.log("\n✅ Nenhum acesso manual de cookies Supabase encontrado.\n");
} else {
  console.log(
    `\n⚠️  ${findings.length} possíveis leituras incorretas detectadas:\n`,
  );
  for (const f of findings) {
    console.log(`📄 ${f.file}:${f.line}`);
    console.log(`   → ${f.context}\n`);
  }

  console.log("💡 Corrija esses trechos para usar:");
  console.log(
    "   const { data: { session } } = await supabase.auth.getSession();\n",
  );
}

console.log("🧠 Dica: adicione este script em seu package.json:");
console.log(
  `   "scripts": { "scan:cookies": "tsx scripts/scan-supabase-cookies.ts" }`,
);
