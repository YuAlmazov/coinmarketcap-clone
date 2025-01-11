"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { IconMenu2, IconX } from '@tabler/icons-react';
import ThemeMenu from './ThemeMenu';
import logo from './logo.png';

const Navbar = () => {
  /**
   * 1) Состояние отображения лого (showImage) + свайп-анимация
   */
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
    // Если свайп больше 50px — «улетаем» логотип за пределы
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

  /**
   * 2) Адаптивное меню (гамбургер)
   */
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Our Team', href: '/team' },
    { label: 'News', href: '/news' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Video', href: '/video' },
    { label: 'Contact us', href: '/contact' },
  ];

  return (
    /**
     * Используем Tailwind-классы:
     * sticky top-0 z-50  => элемент «прилипает» к верху страницы
     * bg-white shadow-sm => фон и тень
     */
    <header className="sticky top-0 z-50 p-4 flex flex-col items-center bg-white shadow-sm">
      <div className="flex justify-between items-center w-full">
        {/* Блок слева: бренд / текст */}
        <div className="text-xl font-bold">CMC</div>

        {/* Кнопка-гамбургер и ThemeMenu справа */}
        <div className="flex items-center space-x-4">
          <ThemeMenu />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </div>
      </div>

      {/* Если нужно показать логотип (с анимацией свайпа) */}
      {showImage && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="my-4"
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

      {/* Меню (Desktop) */}
      <nav className="hidden md:block">
        <ul className="flex space-x-6">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Меню (Mobile) — показывается, если гамбургер «isOpen» */}
      {isOpen && (
        <nav className="md:hidden bg-white w-full mt-3 border-t border-gray-200">
          <ul className="flex flex-col px-4 py-2 space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
