import { useEffect, useRef, useState } from 'react';

const SPHERE_LIFETIME_MS = 400;
const SPHERE_SIZE_PX = 40;

/** Кнопка с анимированной сферой, появляющейся в точке входа курсора. */
export default function HoverSphere({ children, className = '', onClick, disabled, type = 'button' }) {
  const [spheres, setSpheres] = useState([]);
  const ref = useRef(null);
  // Живые таймауты сфер — очищаем при размонтировании, чтобы не обновлять состояние после unmount
  const timeoutsRef = useRef(new Set());

  useEffect(
    () => () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();
    },
    []
  );

  const handleEnter = event => {
    const rect = ref.current.getBoundingClientRect();
    const sphere = {
      id: Date.now() + Math.random(),
      x: event.clientX - rect.left - SPHERE_SIZE_PX / 2,
      y: event.clientY - rect.top - SPHERE_SIZE_PX / 2
    };
    setSpheres(prev => [...prev, sphere]);

    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(timeout);
      setSpheres(prev => prev.filter(item => item.id !== sphere.id));
    }, SPHERE_LIFETIME_MS);
    timeoutsRef.current.add(timeout);
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleEnter}
      className={`relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {spheres.map(sphere => (
        <span
          key={sphere.id}
          className="absolute rounded-full pointer-events-none animate-sphere-grow"
          style={{
            left: sphere.x,
            top: sphere.y,
            width: SPHERE_SIZE_PX,
            height: SPHERE_SIZE_PX,
            background: 'rgba(37, 99, 235, 0.35)'
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
