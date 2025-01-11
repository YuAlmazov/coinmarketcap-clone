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
    { label: 'Video', href: '/video' },
    { label: 'Contact us', href: '/contact' },
  ];

  return (
    /**
     * Используем класс "sticky top-0 z-50" => меню закреплено при скролле
     */
    <header className="sticky top-0 z-50 p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        {/* CMC название/лого (текстом) */}
        <div className="text-xl font-bold">CMC</div>

        {/* Справа: ThemeMenu и гамбургер */}
        <div className="flex items-center space-x-4">
          <ThemeMenu />
          {/* Кнопка (гамбургер) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </div>
      </div>

      {/* Меню (Desktop) */}
      <nav className="hidden md:block mt-2">
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

      {/* Меню (Mobile) — выпадающее */}
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
