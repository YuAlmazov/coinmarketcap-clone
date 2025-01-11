'use client'; // <-- добавляем это!

import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="spinner" />

      <style jsx>{`
        .spinner {
          width: 64px;
          height: 64px;
          border: 8px solid;
          border-radius: 50%;
          /* 4 стороны кольца с разными цветами */
          border-color: #ff0000 #00ff00 #0000ff #ffff00; 
          animation: spin 1s linear infinite, spinColors 3s linear infinite;
        }

        /* Анимация вращения */
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Анимация плавной смены цвета (перелив) */
        @keyframes spinColors {
          0% {
            border-color: #ff0000 #00ff00 #0000ff #ffff00;
          }
          25% {
            border-color: #00ff00 #0000ff #ffff00 #ff0000;
          }
          50% {
            border-color: #0000ff #ffff00 #ff0000 #00ff00;
          }
          75% {
            border-color: #ffff00 #ff0000 #00ff00 #0000ff;
          }
          100% {
            border-color: #ff0000 #00ff00 #0000ff #ffff00;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;