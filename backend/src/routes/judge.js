const express = require('express');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const judge0 = require('../services/judge0Service');
const router = express.Router();

router.post('/submit', protect, async (req, res, next) => {
  try {
    const { problemId, code, hintsUsed = [] } = req.body;
    if (!problemId || !code?.trim()) return res.status(400).json({ error: 'Нужны problemId и code' });

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: 'Задача не найдена' });
    if (!problem.hiddenTests?.length) return res.status(400).json({ error: 'У задачи нет скрытых тестов' });

    const submission = await Submission.create({
      userId: req.user._id,
      problemId: problem._id,
      code,
      hintsUsed,
      totalTests: problem.hiddenTests.length,
      verdict: 'Pending'
    });

    const tokens = [];
    for (const test of problem.hiddenTests) {
      const token = await judge0.submitToJudge(
        code, test.input, test.output, problem.timeLimit, problem.memoryLimit
      );
      tokens.push(token);
    }

    submission.judge0Token = JSON.stringify(tokens);
    await submission.save();

    res.status(202).json({ submissionId: submission._id, tokens });
  } catch (error) {
    // Judge0 не должен раскрывать подробности пользователю
    console.error('Judge0 error:', error.response?.data || error.message);
    next(Object.assign(new Error('Ошибка отправки на проверку'), { status: 502 }));
  }
});

router.get('/status/:submissionId', protect, async (req, res, next) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.submissionId,
      userId: req.user._id
    });
    if (!submission) return res.status(404).json({ error: 'Отправка не найдена' });

    const tokens = JSON.parse(submission.judge0Token || '[]');
    const results = [];
    let passed = 0;
    let finished = true;

    for (const token of tokens) {
      const result = await judge0.getSubmissionResult(token);
      const verdict = judge0.mapStatus(result.status?.id);
      if (verdict === 'Accepted') passed++;
      else finished = false;
      results.push({
        verdict,
        time: result.time,
        memory: result.memory,
        stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8') : '',
        stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf8') : ''
      });
    }

    if (finished) {
      const penalty = (submission.hintsUsed || []).reduce((sum, level) => {
        const hint = submission.hintsUsed ? null : null;
        return sum;
      }, 0);

      // Штраф берём из задачи по открытым уровням подсказок
      const problem = await Problem.findById(submission.problemId);
      const hintPenalty = (submission.hintsUsed || []).reduce((sum, level) => {
        const found = problem?.hints?.find(h => h.level === level);
        return sum + (found?.penalty || 0);
      }, 0);

      const allPassed = passed === submission.totalTests;
      const score = allPassed ? Math.max(0, (problem?.maxScore || 100) - hintPenalty) : 0;

      submission.testPassed = passed;
      submission.verdict = allPassed ? 'Accepted' : results.find(r => r.verdict !== 'Accepted')?.verdict || 'WrongAnswer';
      submission.score = score;
      await submission.save();

      if (allPassed) {
        const user = await User.findById(req.user._id);
        const progress = user.progress.find(p => p.problemId.equals(submission.problemId));
        if (progress) {
          progress.solved = true;
          progress.bestScore = Math.max(progress.bestScore, score);
          progress.attempts += 1;
          progress.lastSubmission = new Date();
        } else {
          user.progress.push({
            problemId: submission.problemId,
            solved: true,
            bestScore: score,
            attempts: 1,
            lastSubmission: new Date()
          });
        }
        await user.save();
      }
    }

    res.json({ submission, results, finished });
  } catch (error) {
    console.error('Judge0 status error:', error.response?.data || error.message);
    next(Object.assign(new Error('Ошибка получения результата'), { status: 502 }));
  }
});

module.exports = router;
