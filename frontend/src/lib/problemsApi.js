import api from '../services/api';

/** Текущий пользователь или null, если не авторизован. */
export async function fetchCurrentUser() {
  try {
    const { data } = await api.get('/api/auth/me');
    return data;
  } catch {
    return null;
  }
}

/** Каталог задач с фильтрами по теме и этапу + пагинация. */
export async function fetchProblems({ topic = '', difficulty = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (topic) params.set('topic', topic);
  if (difficulty) params.set('difficulty', difficulty);
  params.set('page', String(page));
  params.set('limit', String(limit));
  const { data } = await api.get(`/api/problems?${params.toString()}`);
  return data;
}

/** Одна задача по slug (без скрытых тестов). */
export async function fetchProblem(slug) {
  const { data } = await api.get(`/api/problems/${slug}`);
  return data;
}

/** Отправка решения на официальную проверку Judge0. */
export async function submitSolution({ problemId, code, hintsUsed = [] }) {
  const { data } = await api.post('/api/judge/submit', { problemId, code, hintsUsed });
  return data;
}

/** Статус проверки отправки. */
export async function fetchSubmissionStatus(submissionId) {
  const { data } = await api.get(`/api/judge/status/${submissionId}`);
  return data;
}

export async function logout() {
  await api.post('/api/auth/logout');
}

/** Сообщение об ошибке из ответа API или fallback. */
export function apiErrorMessage(error, fallback = 'Произошла ошибка') {
  return error?.response?.data?.error || fallback;
}
