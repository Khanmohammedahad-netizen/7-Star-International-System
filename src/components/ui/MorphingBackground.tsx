export function MorphingBackground({ className }: { className?: string }) {
  return (
    <div
      className={`morphing-bg${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <style>{`
        .morphing-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }
        .morphing-bg::before,
        .morphing-bg::after {
          content: '';
          position: absolute;
          border-radius: 50%;
        }
        .morphing-bg::before {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          top: -200px; right: -200px;
          animation: mFloat1 9s ease-in-out infinite;
        }
        .morphing-bg::after {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          bottom: -150px; left: -150px;
          animation: mFloat2 11s ease-in-out infinite;
        }
        @keyframes mFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(-50px,35px) scale(1.08); }
          66%     { transform: translate(35px,-25px) scale(0.96); }
        }
        @keyframes mFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(70px,-55px) scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .morphing-bg::before,
          .morphing-bg::after { animation: none; }
        }
      `}</style>
    </div>
  )
}
