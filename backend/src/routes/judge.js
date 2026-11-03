const express = require('express');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/authMiddleware');
const judge0 = require('../services/judge0Service');
const { recordSolvedProblem } = require('../services/userProgressService');
const { asyncHandler, ApiError, externalErrorMessage } = require('../utils/errors');
const { hintPenalty, finalVerdict, scoreFor } = require('../utils/scoring');

const router = express.Router();

// Отправка решения: создаёт запись Submission и ставит каждый скрытый тест в очередь Judge0
router.post(
  '/submit',
  protect,
  asyncHandler(async (req, res) => {
    const { problemId, code, hintsUsed = [] } = req.body;
    if (!problemId || !code?.trim()) throw new ApiError(400, 'Нужны problemId и code');

    const problem = await Problem.findById(problemId);
    if (!problem) throw new ApiError(404, 'Задача не найдена');
    if (!problem.hiddenTests?.length) throw new ApiError(400, 'У задачи нет скрытых тестов');

    const submission = await Submission.create({
      userId: req.user._id,
      problemId: problem._id,
      code,
      hintsUsed,
      totalTests: problem.hiddenTests.length,
      verdict: 'Pending'
    });

    try {
      const tokens = [];
      for (const test of problem.hiddenTests) {
        tokens.push(
          await judge0.submitToJudge(code, test.input, test.output, problem.timeLimit, problem.memoryLimit)
        );
      }
      submission.judge0Token = JSON.stringify(tokens);
      await submission.save();
    } catch (error) {
      // Judge0 не должен раскрывать подробности пользователю
      console.error('Judge0 error:', externalErrorMessage(error));
      throw new ApiError(502, 'Ошибка отправки на проверку');
    }

    res.status(202).json({ submissionId: submission._id, tokens });
  })
);

// Статус проверки: собирает результаты всех тестов, при завершении начисляет баллы и обновляет прогресс
router.get(
  '/status/:submissionId',
  protect,
  asyncHandler(async (req, res) => {
    const submission = await Submission.findOne({
      _id: req.params.submissionId,
      userId: req.user._id
    });
    if (!submission) throw new ApiError(404, 'Отправка не найдена');

    let results;
    let passed;
    let finished;
    try {
      const tokens = JSON.parse(submission.judge0Token || '[]');
      const rawResults = await Promise.all(
        tokens.map(token => judge0.getSubmissionResult(token).then(judge0.normalizeResult))
      );
      passed = rawResults.filter(r => r.verdict === 'Accepted').length;
      finished = passed === rawResults.length;
      results = rawResults;
    } catch (error) {
      console.error('Judge0 status error:', externalErrorMessage(error));
      throw new ApiError(502, 'Ошибка получения результата');
    }

    if (finished) {
      const problem = await Problem.findById(submission.problemId);
      const penalty = hintPenalty(problem, submission.hintsUsed);
      const verdict = finalVerdict(passed, submission.totalTests, results);
      const score = scoreFor(problem, penalty, verdict === 'Accepted');

      submission.testPassed = passed;
      submission.verdict = verdict;
      submission.score = score;
      await submission.save();

      if (verdict === 'Accepted') {
        await recordSolvedProblem(req.user._id, submission.problemId, score);
      }
    }

    res.json({ submission, results, finished });
  })
);

module.exports = router;
