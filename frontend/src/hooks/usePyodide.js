import { useCallback, useEffect, useRef, useState } from 'react';

const PYODIDE_VERSION = '0.26.2';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export default function usePyodide() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const pyodideRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!window.loadPyodide) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${BASE}pyodide.js`;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Не удалось загрузить Pyodide'));
            document.head.appendChild(script);
          });
        }
        const py = await window.loadPyodide({ indexURL: BASE });
        if (!cancelled) {
          pyodideRef.current = py;
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const runCode = useCallback(async (code, stdin = '') => {
    if (!pyodideRef.current) throw new Error('Pyodide ещё не загружен');
    const py = pyodideRef.current;

    py.globals.set('__heuristica_stdin', stdin);
    py.runPython(`
import sys, io
sys.stdin = io.StringIO(__heuristica_stdin)
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

    try {
      await py.runPythonAsync(code);
      const stdout = py.runPython('sys.stdout.getvalue()');
      const stderr = py.runPython('sys.stderr.getvalue()');
      return { success: true, output: stdout, error: stderr };
    } catch (e) {
      return { success: false, output: '', error: e.message };
    } finally {
      py.runPython('sys.stdin = sys.__stdin__; sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
    }
  }, []);

  return { ready, error, runCode };
}
