const User = require('../models/User');

/**
 * Обновляет прогресс пользователя после принятого решения:
 * фиксирует лучшее количество баллов и число попыток.
 */
exports.recordSolvedProblem = async (userId, problemId, score) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const lastSubmission = new Date();
  const progress = user.progress.find(p => p.problemId.equals(problemId));

  if (progress) {
    progress.solved = true;
    progress.bestScore = Math.max(progress.bestScore, score);
    progress.attempts += 1;
    progress.lastSubmission = lastSubmission;
  } else {
    user.progress.push({
      problemId,
      solved: true,
      bestScore: score,
      attempts: 1,
      lastSubmission
    });
  }

  await user.save();
  return user;
};
