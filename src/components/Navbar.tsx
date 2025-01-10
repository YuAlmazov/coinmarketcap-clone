"use client";

import React, { useState } from 'react';
import ThemeMenu from './ThemeMenu';
import logo from './logo.png';

const Navbar = () => {
  const [showImage, setShowImage] = useState(true);

  // Координаты и состояния для анимации свайпа
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState<'none' | string>('none');

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    // Сохраняем начальную позицию пальца и сбрасываем анимацию
    setStartX(event.touches[0].clientX);
    setIsDragging(true);
    setTransition('none'); // пока ведём пальцем — без анимации
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    // Смещение от первоначальной точки касания
    const moveX = event.touches[0].clientX;
    setCurrentX(moveX - startX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Проверяем, достаточно ли далеко «смахнули» логотип
    if (Math.abs(currentX) > 50) {
      // Добавляем плавный transition
      setTransition('transform 0.3s ease-out');
      // «Уезжаем» за пределы, чтобы создать эффект «улёта»
      // Можно менять 300px на своё усмотрение.
      if (currentX > 0) {
        setCurrentX(300);
      } else {
        setCurrentX(-300);
      }
    } else {
      // Если свайп был маленьким, то возвращаем на место
      setTransition('transform 0.3s ease-out');
      setCurrentX(0);
    }
  };

  const handleTransitionEnd = () => {
    // Если логотип уехал далеко – скрываем
    if (Math.abs(currentX) === 300) {
      setShowImage(false);
    }
  };

  return (
    <header className="p-4 flex flex-col items-center">
      <div className="flex justify-between items-center w-full">
        <div>CMC</div>
        <ThemeMenu />
      </div>
      {showImage && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="mb-4"
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
      )}
    </header>
  );
};

export default Navbar;
