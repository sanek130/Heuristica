import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverSphere from '../components/HoverSphere';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/auth/me')
      .then(() => navigate('/dashboard'))
      .catch(() => {});
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 animate-fade-in">
        <h1 className="text-center text-4xl font-bold mb-2">Heuristica</h1>
        <p className="text-center text-text-muted mb-8">Подготовка к ВсОШ по программированию</p>
        <HoverSphere
          className="w-full btn-primary"
          onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`; }}
        >
          Войти через Google
        </HoverSphere>
      </div>
    </div>
  );
}
