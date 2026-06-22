import {
  generateEmbedding,
  cosineSimilarity,
} from './embeddingUtils'
import Fuse from 'fuse.js'

/**
 * Fuse.js options tuned for duplicate detection.
 */
const duplicateOptions = {
  keys: ['title'],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 3,
  ignoreLocation: true,
}

/**
 * Find potential duplicate questions based on title similarity.
 *
 * @param {Array} existingQuestions - Array of existing question objects with `title` field
 * @param {string} newTitle - The title of the new question to check
 * @returns {Array} Array of similar questions with score, match info, and duplicate flag
 */
export async function findDuplicates(existingQuestions, newTitle) {
  if (
    !newTitle ||
    !newTitle.trim() ||
    !existingQuestions ||
    existingQuestions.length === 0
  ) {
    return []
  }

  const fuse = new Fuse(existingQuestions, duplicateOptions)
  const results = fuse.search(newTitle.trim())
  try {

  const candidates =
    results.slice(0, 10)

  const queryEmbedding =
    await generateEmbedding(
      newTitle
    )

  const enrichedResults = []

  for (const result of candidates) {

    const candidateEmbedding =
      await generateEmbedding(
        result.item.title
      )

    const semanticScore =
      cosineSimilarity(
        queryEmbedding,
        candidateEmbedding
      )

    const fuseScore =
      1 - (
        result.score || 0
      )

    const finalScore =
      (semanticScore * 0.7)
      +
      (fuseScore * 0.3)

    enrichedResults.push({
      item: result.item,
      score: result.score,
      semanticScore,
      finalScore,
      matches:
        result.matches || [],
      isPotentialDuplicate:
        finalScore > 0.75,
    })
  }

  return enrichedResults
    .filter(
      r => r.finalScore > 0.6
    )
    .sort(
      (a, b) =>
        b.finalScore -
        a.finalScore
    )

} catch (error) {
  console.error('Semantic duplicate detection failed:', error)

  return results.map((result) => ({
    item: result.item,
    score: result.score,
    matches: result.matches || [],
    isPotentialDuplicate:
      result.score < 0.2,
  }))
}
  
}
