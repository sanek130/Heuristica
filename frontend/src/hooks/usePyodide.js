import { useCallback, useEffect, useRef, useState } from 'react';

const PYODIDE_VERSION = '0.26.2';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// Привязка stdin/stdout/stderr для запуска пользовательского кода
const SETUP_PY = `
import sys, io
sys.stdin = io.StringIO(__heuristica_stdin)
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`;
const TEARDOWN_PY = 'sys.stdin = sys.__stdin__; sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__';

/** Инжектит pyodide.js с CDN и возвращает Promise<pyodide>. */
async function loadPyodideRuntime() {
  if (!window.loadPyodide) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${BASE}pyodide.js`;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Не удалось загрузить Pyodide'));
      document.head.appendChild(script);
    });
  }
  return window.loadPyodide({ indexURL: BASE });
}

export default function usePyodide() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const pyodideRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadPyodideRuntime()
      .then(py => {
        if (!cancelled) {
          pyodideRef.current = py;
          setReady(true);
        }
      })
      .catch(e => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const runCode = useCallback(async (code, stdin = '') => {
    if (!pyodideRef.current) throw new Error('Pyodide ещё не загружен');
    const py = pyodideRef.current;

    py.globals.set('__heuristica_stdin', stdin);
    py.runPython(SETUP_PY);

    try {
      await py.runPythonAsync(code);
      const stdout = py.runPython('sys.stdout.getvalue()');
      const stderr = py.runPython('sys.stderr.getvalue()');
      return { success: true, output: stdout, error: stderr };
    } catch (e) {
      return { success: false, output: '', error: e.message };
    } finally {
      py.runPython(TEARDOWN_PY);
    }
  }, []);

  return { ready, error, runCode };
}
