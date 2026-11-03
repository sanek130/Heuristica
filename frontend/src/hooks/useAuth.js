import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '../lib/problemsApi';

/**
 * Состояние авторизации: проверяет текущую сессию при монтировании.
 * loading — идёт ли запрос; user — данные пользователя или null.
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser().then(data => {
      if (!cancelled) {
        setUser(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
