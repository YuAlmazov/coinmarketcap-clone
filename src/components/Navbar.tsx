"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { IconMenu2, IconX } from '@tabler/icons-react';
import ThemeMenu from './ThemeMenu';

const Navbar = () => {
  /**
   * 1) Адаптивное меню (гамбургер)
   * (Логика «свайпа лого» убрана, т.к. она теперь в LogoPanel.tsx)
   */
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Our Team', href: '/team' },
    { label: 'News', href: '/news' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Exchanges', href: '/exchanges' },
    { label: 'Video', href: '/video' },
    { label: 'Contact us', href: '/contact' },
  ];

  return (
    /**
     * Используем класс "sticky top-0 z-50" => меню закреплено при скролле
     */
    <header className="sticky top-0 z-50 p-4 shadow-sm">
      <div className="flex justify-between items-center">
        {/* CMC название/лого (текстом) */}
        <div className="text-xl font-bold tracking-wider text-gray-800">CMC</div>

        {/* Справа: ThemeMenu и гамбургер */}
        <div className="flex items-center space-x-4">
          <ThemeMenu />
          {/* Кнопка (гамбургер) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-blue-600 
                       focus:outline-none transition-colors duration-300"
          >
            {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </div>
      </div>

      {/* Меню (Desktop) */}
      <nav className="hidden md:block mt-2">
        {/* Центрируем ссылки */}
        <ul className="flex justify-center space-x-4">
          {menuItems.map((item) => (
            <li key={item.label}>
              {/* Делаем «технологичный» стиль ссылок */}
              <Link
                href={item.href}
                className="
                  px-3 py-2 rounded-md
                  bg-gradient-to-r from-gray-700 via-gray-900 to-black
                  text-white
                  hover:from-blue-600 hover:via-blue-800 hover:to-purple-800
                  transition-all duration-300
                  shadow-md hover:shadow-xl
                  transform hover:-translate-y-0.5
                "
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Меню (Mobile) — выпадающее с «высокотехнологичной» анимацией */}
      <div
        className={`
          md:hidden mt-3 border-t border-gray-200 
          overflow-hidden transition-all duration-500 ease-in-out
          transform origin-top
          ${isOpen ? 'max-h-96 opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'}
        `}
      >
        <nav className="w-full">
          <ul className="flex flex-col px-4 py-2 space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                {/* Применяем тот же стиль ссылок, но на всю ширину */}
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="
                    block w-full text-center py-2
                    rounded-md text-white
                    bg-gradient-to-r from-gray-700 via-gray-900 to-black
                    hover:from-blue-600 hover:via-blue-800 hover:to-purple-800
                    shadow-md hover:shadow-xl
                    transition-all duration-300
                    transform hover:-translate-y-0.5
                  "
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
