import { useRef, useState } from 'react';

export default function HoverSphere({ children, className = '', onClick, disabled, type = 'button' }) {
  const [spheres, setSpheres] = useState([]);
  const ref = useRef(null);

  const handleEnter = event => {
    const rect = ref.current.getBoundingClientRect();
    const sphere = {
      id: Date.now() + Math.random(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    setSpheres(prev => [...prev, sphere]);
    setTimeout(() => setSpheres(prev => prev.filter(item => item.id !== sphere.id)), 400);
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
            left: sphere.x - 20,
            top: sphere.y - 20,
            width: 40,
            height: 40,
            background: 'rgba(37, 99, 235, 0.35)'
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
