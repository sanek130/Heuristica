const axios = require('axios');
const { JUDGE0 } = require('../config/constants');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';

const client = axios.create({
  baseURL: JUDGE0_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
    'X-RapidAPI-Host': new URL(JUDGE0_URL).host
  }
});

const b64 = value => Buffer.from(value || '', 'utf8').toString('base64');
const decodeB64 = value => (value ? Buffer.from(value, 'base64').toString('utf8') : '');

/** Отправляет решение с одним тестом в Judge0, возвращает токен проверки. */
exports.submitToJudge = async (code, stdin, expectedOutput, timeLimit, memoryLimit) => {
  const { data } = await client.post('/submissions?base64_encoded=true&wait=false', {
    language_id: JUDGE0.pythonLanguageId,
    source_code: b64(code),
    stdin: b64(stdin),
    expected_output: b64(expectedOutput),
    cpu_time_limit: Math.max(JUDGE0.minCpuTimeLimitSec, Math.round(timeLimit / 1000)),
    memory_limit: memoryLimit * JUDGE0.kbPerMb
  });
  return data.token;
};

/** Получает сырой результат проверки по токену. */
exports.getSubmissionResult = async token => {
  const { data } = await client.get(`/submissions/${token}?base64_encoded=true`);
  return data;
};

/** Нормализует результат Judge0 к виду, безопасному для фронтенда. */
exports.normalizeResult = result => ({
  verdict: exports.mapStatus(result.status?.id),
  time: result.time,
  memory: result.memory,
  stdout: decodeB64(result.stdout),
  stderr: decodeB64(result.stderr)
});

// Преобразование статуса Judge0 в вердикт приложения
exports.mapStatus = status => {
  const map = {
    3: 'Accepted',
    4: 'WrongAnswer',
    5: 'TimeLimitExceeded',
    6: 'CompilationError'
  };
  // Остальные статусы (7–14) — внутренние ошибки исполнения
  if (status >= 7 && status <= 14) return 'RuntimeError';
  return map[status] || 'ServerError';
};
