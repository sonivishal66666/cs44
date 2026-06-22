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
export function findDuplicates(existingQuestions, newTitle) {
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

  return results.map((result) => ({
    item: result.item,
    score: result.score,
    matches: result.matches || [],
    // In Fuse.js, lower score = better match. Score < 0.2 means very similar.
    isPotentialDuplicate: result.score < 0.2,
  }))
}
