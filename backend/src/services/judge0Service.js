const axios = require('axios');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const PYTHON3_LANGUAGE_ID = 71;

const headers = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
  'X-RapidAPI-Host': new URL(JUDGE0_URL).host
};

const b64 = value => Buffer.from(value || '', 'utf8').toString('base64');

exports.submitToJudge = async (code, stdin, expectedOutput, timeLimit, memoryLimit) => {
  const { data } = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
    {
      language_id: PYTHON3_LANGUAGE_ID,
      source_code: b64(code),
      stdin: b64(stdin),
      expected_output: b64(expectedOutput),
      cpu_time_limit: Math.max(1, Math.round(timeLimit / 1000)),
      memory_limit: memoryLimit * 1024
    },
    { headers }
  );
  return data.token;
};

exports.getSubmissionResult = async token => {
  const { data } = await axios.get(
    `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
    { headers }
  );
  return data;
};

// Преобразование статуса Judge0 в вердикт приложения
exports.mapStatus = status => {
  const map = {
    3: 'Accepted',
    4: 'WrongAnswer',
    5: 'TimeLimitExceeded',
    6: 'CompilationError',
    7: 'RuntimeError',
    8: 'RuntimeError',
    9: 'RuntimeError',
    10: 'RuntimeError',
    11: 'RuntimeError',
    12: 'RuntimeError',
    13: 'RuntimeError',
    14: 'RuntimeError'
  };
  return map[status] || 'ServerError';
};
