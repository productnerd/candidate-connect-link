// Pending score storage for anonymous practice tests
// Stores the latest practice test result in localStorage so it can be
// migrated to the user's account after signup

export interface PendingPracticeScore {
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  category_scores: Record<string, { correct: number; total: number }>;
  test_type: string;
  completed_at: string;
}

const PENDING_SCORE_KEY = 'pending_practice_score';

/**
 * Save a practice test score to localStorage.
 * Always saves the latest score (overwrites previous).
 */
export function savePendingScore(score: PendingPracticeScore): void {
  try {
    localStorage.setItem(PENDING_SCORE_KEY, JSON.stringify(score));
  } catch (error) {
    console.error('Failed to save pending score:', error);
  }
}

/**
 * Load a pending practice score from localStorage.
 * Returns null if no pending score exists.
 */
export function loadPendingScore(): PendingPracticeScore | null {
  try {
    const stored = localStorage.getItem(PENDING_SCORE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PendingPracticeScore;
  } catch (error) {
    console.error('Failed to load pending score:', error);
    return null;
  }
}

/**
 * Clear the pending score from localStorage.
 * Call this after successfully migrating the score to the database.
 */
export function clearPendingScore(): void {
  try {
    localStorage.removeItem(PENDING_SCORE_KEY);
  } catch (error) {
    console.error('Failed to clear pending score:', error);
  }
}

/**
 * Check if there's a pending score waiting to be migrated.
 */
export function hasPendingScore(): boolean {
  return localStorage.getItem(PENDING_SCORE_KEY) !== null;
}
