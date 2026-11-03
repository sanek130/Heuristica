import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HoverSphere from '../components/HoverSphere';
import api from '../services/api';

const topics = ['arrays','sorting','two_pointers','binary_search','dp','graphs','trees','math','strings'];
const levels = ['municipal','regional','final'];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [problems, setProblems] = useState([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => navigate('/login'));

    api.get('/api/problems')
      .then(({ data }) => setProblems(data.items))
      .catch(() => toast.error('Не удалось загрузить задачи'));
  }, [navigate]);

  const logout = async () => {
    await api.post('/api/auth/logout');
    navigate('/login');
  };

  const filtered = problems.filter(problem =>
    (!topic || problem.topic === topic) && (!difficulty || problem.difficulty === difficulty)
  );

  if (!user) return <div className="py-20 text-center text-text-muted">Загрузка…</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Привет, {user.displayName}!</h1>
          <p className="text-text-muted">Решено задач: {user.progress?.filter(item => item.solved).length || 0}</p>
        </div>
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full border-2 border-accent-blue" />
          <HoverSphere className="btn-secondary" onClick={logout}>Выйти</HoverSphere>
        </div>
      </header>

      <div className="mb-8 grid gap-4 rounded-lg border border-border bg-surface p-6 md:grid-cols-2">
        <select className="rounded-lg border border-border bg-background px-4 py-2" value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">Все темы</option>
          {topics.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="rounded-lg border border-border bg-background px-4 py-2" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="">Все уровни</option>
          {levels.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(problem => {
          const progress = user.progress?.find(item => item.problemId === problem._id);
          return (
            <Link key={problem._id} to={`/problem/${problem.slug}`}>
              <HoverSphere className="h-full w-full text-left">
                <div className="h-full rounded-lg border border-border bg-surface p-6 transition hover:border-accent-blue">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{problem.title}</h3>
                    {progress?.solved && <span className="rounded-full bg-accent-gold/20 px-2 py-1 text-xs text-accent-gold">Решено</span>}
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
        })}
      </div>
    </div>
  );
}
