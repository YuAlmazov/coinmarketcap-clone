// src\components\LogoPanel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import logo from './logo.png';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';

const LogoPanel: React.FC = () => {
  const [showImage, setShowImage] = useState(true);

  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState<'none' | string>('none');

  // -----------------------------
  //  Логика сердечка для LTC
  // -----------------------------
  const [ltcHeart, setLtcHeart] = useState(false);

  useEffect(() => {
    localforage.getItem<boolean>('ltcHeart').then((val) => {
      if (typeof val === 'boolean') {
        setLtcHeart(val);
      }
    });
  }, []);

  // Следим за изменениями, чтобы актуализировать в localforage
  useEffect(() => {
    localforage.setItem('ltcHeart', ltcHeart);
  }, [ltcHeart]);

  // -----------------------------
  //  Логика свайпа логотипа
  // -----------------------------
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
    <div className="flex flex-col items-center justify-center">
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

      {/* Тут показываем сердце — заполненное, если пользователь кликнул по нему в LitecoinSingleTable */}

    </div>
  );
};

export default LogoPanel;
