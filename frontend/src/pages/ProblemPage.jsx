import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import CodeEditor from '../components/CodeEditor';
import HoverSphere from '../components/HoverSphere';
import usePyodide from '../hooks/usePyodide';
import api from '../services/api';

export default function ProblemPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('# Ваш код на Python\n');
  const [output, setOutput] = useState('');
  const [hints, setHints] = useState([]);
  const [submissionId, setSubmissionId] = useState(null);
  const { ready, runCode } = usePyodide();

  useEffect(() => {
    api.get(`/api/problems/${slug}`)
      .then(({ data }) => setProblem(data))
      .catch(() => toast.error('Не удалось загрузить задачу'));
  }, [slug]);

  const runLocal = async () => {
    const test = problem?.publicTests?.[0];
    if (!test) return toast.error('Нет публичного теста');
    const result = await runCode(code, test.input);
    const passed = result.success && result.output.trim() === test.output.trim();
    setOutput(passed ? `Тест пройден\nВывод:\n${result.output}` : `Тест не пройден\nОжидалось:\n${test.output}\nПолучено:\n${result.output}\nОшибка:\n${result.error}`);
    passed ? toast.success('Публичный тест пройден') : toast.error('Тест не пройден');
  };

  const submit = async () => {
    try {
      const { data } = await api.post('/api/judge/submit', {
        problemId: problem._id,
        code,
        hintsUsed: hints
      });
      setSubmissionId(data.submissionId);
      toast.success('Отправлено на официальную проверку');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Ошибка отправки');
    }
  };

  const check = async () => {
    if (!submissionId) return;
    try {
      const { data } = await api.get(`/api/judge/status/${submissionId}`);
      if (data.finished) {
        setOutput(`Вердикт: ${data.submission.verdict}\nПройдено тестов: ${data.submission.testPassed}/${data.submission.totalTests}\nБаллы: ${data.submission.score}`);
        toast.success(data.submission.verdict === 'Accepted' ? 'Задача принята' : 'Есть непройденные тесты');
      } else {
        toast('Проверка ещё выполняется');
      }
    } catch {
      toast.error('Ошибка получения результата');
    }
  };

  if (!problem) return <div className="py-20 text-center text-text-muted">Загрузка…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-3 text-xl font-semibold">Условие</h2>
            <div className="whitespace-pre-wrap text-text-secondary" dangerouslySetInnerHTML={{ __html: problem.description }} />
          </div>
          {problem.publicTests.map((test, index) => (
            <div key={index} className="rounded-lg border border-border bg-surface p-6">
              <p className="mb-1 text-sm text-text-muted">Входные данные</p>
              <pre className="overflow-x-auto rounded bg-background p-3 text-sm">{test.input}</pre>
              <p className="mb-1 mt-3 text-sm text-text-muted">Ожидаемый вывод</p>
              <pre className="overflow-x-auto rounded bg-background p-3 text-sm">{test.output}</pre>
            </div>
          ))}
          {problem.hints?.map(hint => (
            <div key={hint.level} className="rounded-lg border border-border bg-surface p-4">
              {hints.includes(hint.level) ? (
                <p className="text-text-secondary">{hint.text}</p>
              ) : (
                <HoverSphere className="btn-secondary w-full" onClick={() => setHints(prev => [...prev, hint.level])}>
                  Подсказка {hint.level} (−{hint.penalty} баллов)
                </HoverSphere>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <CodeEditor value={code} onChange={setCode} />
          </div>
          {output && <pre className="whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm">{output}</pre>}
          <div className="flex gap-4">
            <HoverSphere className="btn-secondary flex-1" disabled={!ready} onClick={runLocal}>
              {ready ? 'Локальный тест' : 'Pyodide загружается…'}
            </HoverSphere>
            <HoverSphere className="btn-primary flex-1" onClick={submit}>Отправить на проверку</HoverSphere>
            <HoverSphere className="btn-secondary flex-1" disabled={!submissionId} onClick={check}>Проверить статус</HoverSphere>
          </div>
        </div>
      </div>
    </div>
  );
}
