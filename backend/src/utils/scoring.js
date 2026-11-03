// Доменная логика подсчёта результата отправки (вынесена из маршрута judge)

const { DEFAULT_MAX_SCORE } = require('../config/constants');

/** Суммарный штраф за использованные уровни подсказок. */
const hintPenalty = (problem, hintsUsed = []) =>
  hintsUsed.reduce((sum, level) => {
    const hint = problem?.hints?.find(h => h.level === level);
    return sum + (hint?.penalty || 0);
  }, 0);

/** Итоговый вердикт: Accepted только если пройдены все тесты. */
const finalVerdict = (passed, totalTests, results) =>
  passed === totalTests
    ? 'Accepted'
    : results.find(r => r.verdict !== 'Accepted')?.verdict || 'WrongAnswer';

/** Баллы: максимум задачи минус штраф за подсказки, но не ниже нуля. */
const scoreFor = (problem, penalty, accepted) =>
  accepted ? Math.max(0, (problem?.maxScore || DEFAULT_MAX_SCORE) - penalty) : 0;

module.exports = { hintPenalty, finalVerdict, scoreFor };
