import fs from 'fs'
import path from 'path'

interface JdmEntry {
  name: string
  url?: string
  difficulty?: string
  notes?: string
  domains?: string[]
  email?: string
}

interface CancellationEntry {
  name: string
  keywords: string[]
  loginUrl: string
  cancelUrl: string
  method: 'url' | 'phone' | 'chat'
  notes: string
  difficulty: 'easy' | 'hard'
  tier: 'auto' | 'session' | 'manual'
}

const jdmRaw: JdmEntry[] = JSON.parse(
  fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), 'jdm-raw.json'), 'utf8')
)

// Keywords already claimed by our hand-curated entries — JDM entries lose on conflict
const EXISTING_KEYWORDS = new Set([
  'netflix', 'spotify', 'adobe', 'creative cloud', 'icloud', 'apple',
  'chatgpt', 'openai', 'amazon', 'prime', 'youtube', 'disney',
  'canva', 'test', 'easystream', 'darkstream',
])

function toKeywords(name: string, domains: string[] = []): string[] {
  const words = new Set<string>()

  // Full name lowercased
  words.add(name.toLowerCase())

  // Individual tokens (words > 2 chars)
  for (const token of name.toLowerCase().split(/[\s\-_/.()+]+/)) {
    if (token.length > 2) words.add(token)
  }

  // Base domain name (second-to-last segment, e.g. "spotify" from "spotify.com")
  for (const d of domains) {
    const parts = d.split('.')
    if (parts.length >= 2) {
      const base = parts[parts.length - 2]
      if (base.length > 2) words.add(base.toLowerCase())
    }
  }

  return [...words]
}

function mapDifficulty(d?: string): 'easy' | 'hard' {
  return d === 'easy' || d === 'medium' ? 'easy' : 'hard'
}

function mapMethod(entry: JdmEntry): 'url' | 'phone' | 'chat' {
  const notes = (entry.notes ?? '').toLowerCase()
  if (notes.includes('phone') || notes.includes('call')) return 'phone'
  if (entry.email) return 'chat'
  return 'url'
}

function primaryLoginUrl(domains: string[] = [], cancelUrl: string): string {
  if (domains.length > 0) return `https://${domains[0]}`
  try {
    const u = new URL(cancelUrl)
    return `${u.protocol}//${u.hostname}`
  } catch {
    return ''
  }
}

const mapped: CancellationEntry[] = []
let skipped = 0

for (const entry of jdmRaw) {
  if (!entry.name || !entry.url) { skipped++; continue }

  const keywords = toKeywords(entry.name, entry.domains)

  // Our existing entries take priority — skip if any keyword conflicts
  if (keywords.some(k => EXISTING_KEYWORDS.has(k))) { skipped++; continue }

  const loginUrl = primaryLoginUrl(entry.domains, entry.url)
  if (!loginUrl) { skipped++; continue }

  mapped.push({
    name: entry.name,
    keywords,
    loginUrl,
    cancelUrl: entry.url,
    method: mapMethod(entry),
    notes: entry.notes ?? '',
    difficulty: mapDifficulty(entry.difficulty),
    tier: 'manual',
  })
}

const scriptDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))
const outPath = path.join(scriptDir, '..', 'lib', 'jdm-db.json')
fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2), 'utf8')

console.log(`Mapped: ${mapped.length}  Skipped: ${skipped}  Total JDM: ${jdmRaw.length}`)
