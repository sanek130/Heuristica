import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HoverSphere from '../components/HoverSphere';
import useAuth from '../hooks/useAuth';

const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`;

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Уже авторизованный пользователь сразу попадает в дашборд
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 animate-fade-in">
        <h1 className="text-center text-4xl font-bold mb-2">Heuristica</h1>
        <p className="text-center text-text-muted mb-8">Подготовка к ВсОШ по программированию</p>
        <HoverSphere className="w-full btn-primary" onClick={() => { window.location.href = GOOGLE_LOGIN_URL; }}>
          Войти через Google
        </HoverSphere>
      </div>
    </div>
  );
}
