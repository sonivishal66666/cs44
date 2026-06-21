import { pipeline } from '@xenova/transformers'

let extractor = null

const embeddingCache = new Map()

export async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )
  }

  return extractor
}

export async function generateEmbedding(text) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)
  }

  const model = await getExtractor()

  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  })

  const embedding = Array.from(output.data)

  embeddingCache.set(text, embedding)

  return embedding
}

export function cosineSimilarity(a, b) {
  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}