import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HoverSphere from '../components/HoverSphere';
import useAuth from '../hooks/useAuth';
import { fetchProblems, logout, apiErrorMessage } from '../lib/problemsApi';
import { TOPICS, DIFFICULTY_LEVELS } from '../constants/catalog';

/** Карточка одной задачи в каталоге. */
function ProblemCard({ problem, solved }) {
  return (
    <Link to={`/problem/${problem.slug}`}>
      <HoverSphere className="h-full w-full text-left">
        <div className="h-full rounded-lg border border-border bg-surface p-6 transition hover:border-accent-blue">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-semibold">{problem.title}</h3>
            {solved && <span className="rounded-full bg-accent-gold/20 px-2 py-1 text-xs text-accent-gold">Решено</span>}
          </div>
          <div className="mb-4 flex gap-2 text-xs text-text-muted">
            <span className="rounded bg-background px-2 py-1">{problem.topic}</span>
            <span className="rounded bg-background px-2 py-1">{problem.difficulty}</span>
          </div>
          <div className="text-sm font-medium text-accent-blue">Открыть задачу →</div>
        </div>
      </HoverSphere>
    </Link>
  );
}

/** Выпадающий список фильтра с пустым значением «все». */
function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      aria-label={label}
      className="rounded-lg border border-border bg-background px-4 py-2"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Все {label}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

export default function Dashboard() {
  const { user, loading: loadingUser } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');

  // Гость перенаправляется на страницу входа
  useEffect(() => {
    if (!loadingUser && !user) navigate('/login');
  }, [loadingUser, user, navigate]);

  useEffect(() => {
    fetchProblems({ limit: 50 })
      .then(({ items }) => setProblems(items))
      .catch(error => toast.error(apiErrorMessage(error, 'Не удалось загрузить задачи')));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const filtered = useMemo(
    () =>
      problems.filter(
        problem =>
          (!topic || problem.topic === topic) &&
          (!difficulty || problem.difficulty === difficulty)
      ),
    [problems, topic, difficulty]
  );

  if (!user) return <div className="py-20 text-center text-text-muted">Загрузка…</div>;

  const solvedCount = user.progress?.filter(item => item.solved).length || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Привет, {user.displayName}!</h1>
          <p className="text-text-muted">Решено задач: {solvedCount}</p>
        </div>
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full border-2 border-accent-blue" />
          <HoverSphere className="btn-secondary" onClick={handleLogout}>Выйти</HoverSphere>
        </div>
      </header>

      <div className="mb-8 grid gap-4 rounded-lg border border-border bg-surface p-6 md:grid-cols-2">
        <FilterSelect label="темы" value={topic} onChange={setTopic} options={TOPICS} />
        <FilterSelect label="уровни" value={difficulty} onChange={setDifficulty} options={DIFFICULTY_LEVELS} />
      </div>

      {!loadingUser && filtered.length === 0 && (
        <p className="py-12 text-center text-text-muted">Задачи не найдены.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(problem => (
          <ProblemCard
            key={problem._id}
            problem={problem}
            solved={user.progress?.find(item => item.problemId === problem._id)?.solved}
          />
        ))}
      </div>
    </div>
  );
}
