import { normalizeWord, isValidAnswer } from "./validation.js";

export function scoreAnswer(answer, allAnswers, categoryId, letter, lang) {
  if (!answer?.trim()) return 0;
  // Validate word belongs to category
  if (categoryId && letter && !isValidAnswer(answer, categoryId, letter, lang)) return -1; // invalid
  const norm = normalizeWord(answer);
  const filled = allAnswers.map(a => a?.trim() ? normalizeWord(a) : "").filter(Boolean);
  const count = filled.filter(a => a === norm).length;
  return count === 1 ? 2 : count >= 2 ? 1 : 0;
}
