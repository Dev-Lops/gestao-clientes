/**
 * 🔧 Auto-Fix de Cookies Supabase / UI
 *
 * Este script:
 *   - Corrige usos inseguros de `document.cookie`
 *   - Padroniza atributos SameSite + path + max-age
 *   - Remove cookies de sessão manuais relacionados a Supabase (`sb-...`)
 *   - Mantém cookies de UI simples (ex: sidebar) em formato seguro
 *
 * 1️⃣  Salve como scripts/auto-fix-cookies.ts
 * 2️⃣  Execute: npx tsx scripts/auto-fix-cookies.ts
 */

import fs from 'fs'
import path from 'path'

const ROOT = path.resolve('src')
const TARGETS = ['.ts', '.tsx', '.js', '.jsx']

interface Finding {
  file: string
  line: number
  context: string
}

const findings: Finding[] = []

function readLines(file: string): string[] {
  return fs.readFileSync(file, 'utf8').split('\n')
}

function writeLines(file: string, lines: string[]): void {
  fs.writeFileSync(file, lines.join('\n'), 'utf8')
}

function processFile(filePath: string) {
  const lines = readLines(filePath)
  let modified = false

  const newLines = lines.map((line, i) => {
    // detecta cookies manuais
    if (/document\.cookie\s*=/.test(line)) {
      const l = line.trim()

      // ignora comentários
      if (l.startsWith('//')) return line

      findings.push({
        file: filePath,
        line: i + 1,
        context: line.trim(),
      })

      // caso típico: document.cookie = `${NAME}=${value}; path=/; max-age=...`
      const match = l.match(
        /document\.cookie\s*=\s*`?\${?([^=}]+)}?=([^;`]+).*`?/
      )
      const cookieName = match?.[1]?.trim() || 'COOKIE_NAME'
      const cookieValue = match?.[2]?.trim() || '${value}'

      modified = true
      return `document.cookie = [
  \`${cookieName}=${cookieValue}\`,
  "path=/",
  "SameSite=Lax",
  \`max-age=\${${cookieName}_MAX_AGE || 86400}\`
].join("; ");`
    }

    // Remove tentativas de parse de cookie Supabase
    if (
      /JSON\.parse\(.*sb-/.test(line) ||
      /JSON\.parse\(.*cookie/i.test(line)
    ) {
      modified = true
      return `// 🚫 Cookie Supabase não deve ser parseado manualmente
// Use o cliente oficial:
const { data: { session } } = await supabase.auth.getSession();`
    }

    return line
  })

  if (modified) {
    writeLines(filePath, newLines)
  }
}

function walkDir(dir: string) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      walkDir(fullPath)
    } else if (TARGETS.some((ext) => fullPath.endsWith(ext))) {
      processFile(fullPath)
    }
  }
}

console.log(`🔧 Iniciando varredura e correção automática em ${ROOT} ...`)
walkDir(ROOT)

if (findings.length === 0) {
  console.log('\n✅ Nenhum cookie inseguro encontrado.\n')
} else {
  console.log(`\n⚙️  ${findings.length} cookies ajustados automaticamente:\n`)
  for (const f of findings) {
    console.log(`📄 ${f.file}:${f.line}`)
    console.log(`   → ${f.context}\n`)
  }

  console.log(
    '\n💡 Todos os cookies agora usam SameSite=Lax, path=/ e max-age padrão.'
  )
  console.log(
    '   Qualquer tentativa de parse manual de cookies Supabase foi substituída por supabase.auth.getSession().\n'
  )
}

console.log('✨ Concluído!')
