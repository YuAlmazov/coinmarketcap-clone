"use client";

import React, { useState, useRef } from 'react';
import ThemeMenu from './ThemeMenu';
import logo from './logo.png';

const Navbar = () => {
  const [showImage, setShowImage] = useState(true);
  const touchStartX = useRef(0);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchEndX = event.changedTouches[0].clientX;
    if (Math.abs(touchEndX - touchStartX.current) > 50) {
      setShowImage(false);
    }
  };

  return (
    <header className="p-4 flex flex-col items-center">
      {showImage && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="mb-4"
        >
          <img
            src={logo.src}
            alt="Logo"
            className="w-64 h-auto"
          />
        </div>
      )}
      <div className="flex justify-between items-center w-full">
        <div>CMC</div>
        <ThemeMenu />
      </div>
    </header>
  );
};

export default Navbar;