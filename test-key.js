const jwt = require('jsonwebtoken')

const token = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!token) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const decoded = jwt.decode(token)
console.log('🔍 Token decodificado:\n', decoded)
