export const SENSITIVE_PATTERNS = [
  {
    name: 'credit_card',
    regex: /\b(\d{4}[\s\-]){3}(\d{4})\b/g,
    keepLast: 4,
  },
  {
    name: 'israeli_id',
    regex: /\b\d{9}\b/g,
    keepLast: 0,
  },
  {
    name: 'ssn',
    regex: /\b\d{3}[\s\-]\d{2}[\s\-]\d{4}\b/g,
    keepLast: 0,
  },
  {
    name: 'iban',
    regex: /\b[A-Z]{2}\d{2}[\s]?(\d{4}[\s]?){4,6}\d{1,4}\b/g,
    keepLast: 0,
  },
  {
    name: 'email',
    regex: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,
    keepLast: 0,
  },
]

export function findSensitiveText(text: string): Array<{
  pattern: string
  match: string
  index: number
}> {
  const results = []
  for (const p of SENSITIVE_PATTERNS) {
    p.regex.lastIndex = 0
    let match
    while ((match = p.regex.exec(text)) !== null) {
      results.push({
        pattern: p.name,
        match: match[0],
        index: match.index,
      })
    }
  }
  return results
}
