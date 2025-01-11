
'use client';

import React, { useState } from 'react';
import logo from './logo.png';

/**
 * Логика «свайпа» вынесена сюда:
 */
const LogoPanel: React.FC = () => {
  const [showImage, setShowImage] = useState(true);

  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState<'none' | string>('none');

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
    return null; // Если логотип «улетел» — ничего не рендерим
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="my-4 flex justify-center"
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
  );
};

export default LogoPanel;
