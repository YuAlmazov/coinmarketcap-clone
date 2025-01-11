"use client";

import React, { useState } from 'react';
import logo from './logo.png';
/**
 * Логика «свайпа» (как раньше) + бегущая «пиксельная» надпись с анимацией,
 * теперь весь контент отцентрирован по вертикали.
 */
const LogoPanel: React.FC = () => {
  const [showImage, setShowImage] = useState(true);

  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState<'none' | string>('none');

  // Логика свайпа логотипа
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setStartX(event.touches[0].clientX);
    setIsDragging(true);
    setTransition('none');
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const moveX = event.touches[0].clientX;
    setCurrentX(moveX - startX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Если свайп больше 50px — «улетает»
    if (Math.abs(currentX) > 50) {
      setTransition('transform 0.3s ease-out');
      if (currentX > 0) {
        setCurrentX(300);
      } else {
        setCurrentX(-300);
      }
    } else {
      setTransition('transform 0.3s ease-out');
      setCurrentX(0);
    }
  };

  const handleTransitionEnd = () => {
    if (Math.abs(currentX) === 300) {
      setShowImage(false);
    }
  };

  if (!showImage) {
    return null; // Если логотип «улетел» — не показываем ничего
  }

  return (
    // Обёртка на всю высоту экрана, чтобы центрировать вертикально
    
    <div className=" flex flex-col items-center justify-center">
      {/* Логотип со свайпом */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="mb-6 flex justify-center"
      >
        <img
          src={logo.src}
          alt="Logo"
          className="w-64 h-auto"
          style={{
            transform: `translateX(${currentX}px)`,
            transition: transition,
          }}
          onTransitionEnd={handleTransitionEnd}
        />
      </div>

      {/* Анимированная «пиксельная» надпись + эффекты */}
      <div className="relative overflow-hidden w-full h-16 flex items-center justify-center">
        
        {/* Сам текст (крупный шрифт, моноширинный) */}
        <div
          className="
            relative inline-block 
            font-mono text-3xl font-bold
            text-blue-800
            px-4
            whitespace-nowrap
            animate-sideToSide
          "
        >
            {/* Первый эффект: «молния» */}
          <div className="absolute right animate-lightning text-yellow-100">
            ⚡
          </div>

          {/* Второй эффект: «искры» */}
          <div className="absolute right animate-sparks text-pink-100">
            ✨
          </div>
               https://coinmarketcrap.info/ спонсирован Litecoin

          {/* Первый эффект: «молния» */}
          <div className="absolute top-0 left-full animate-lightning text-yellow-500">
            ⚡
          </div>

          {/* Второй эффект: «искры» */}
          <div className="absolute bottom-0 left-full animate-sparks text-pink-500">
            ✨
          </div>
        </div>
      </div>

      {/* Подключаем стили анимации через style-jsx (или глобальные) */}
      <style jsx>{`
        /* Движение текста из стороны в сторону */
        @keyframes sideToSide {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(50%);
          }
          50% {
            transform: translateX(0);
          }
          75% {
            transform: translateX(-50%);
          }
        }
        .animate-sideToSide {
          animation: sideToSide  6s infinite ease-in-out;
        }

        /* Молния: прыгает и слегка вращается */
        @keyframes lightning {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(-20px, -20px) rotate(20deg);
            opacity: 0.6;
          }
        }
        .animate-lightning {
          animation: lightning 1s infinite ease-in-out;
        }

        /* Искры: колеблются в чуть ином ритме */
        @keyframes sparks {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0);
            opacity: 1;
          }
          50% {
            transform: translate(10px, 10px) scale(1.2) rotate(15deg);
            opacity: 0.7;
          }
        }
        .animate-sparks {
          animation: sparks 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LogoPanel;
