// ПУТЬ: src/components/CryptoCarousel.tsx
'use client';

import React, { useState, useRef } from 'react';

/**
 * Получить YouTube ID из ссылки вида https://www.youtube.com/watch?v=XYZ
 */
function extractVideoId(watchLink: string) {
  try {
    const url = new URL(watchLink);
    return url.searchParams.get('v') || '';
  } catch {
    return '';
  }
}

export default function CryptoCarousel({
  videos,
}: {
  videos: { title: string; watchLink: string }[];
}) {
  // 1) Убираем дубли по videoId
  const uniqueById = new Map<string, { title: string; watchLink: string }>();
  for (const v of videos) {
    const id = extractVideoId(v.watchLink);
    if (id && !uniqueById.has(id)) {
      uniqueById.set(id, v);
    }
  }
  const uniqueVideos = Array.from(uniqueById.values());

  // 2) Фильтруем «Invalid link»
  const validVideos = uniqueVideos.filter((v) => extractVideoId(v.watchLink));

  // 3) Текущее видео
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!validVideos.length) {
    return <div>No valid videos found.</div>;
  }

  // Безопасный индекс
  const safeIndex = Math.max(0, Math.min(currentIndex, validVideos.length - 1));
  const video = validVideos[safeIndex];
  const videoId = extractVideoId(video.watchLink);

  // 4) Свайп
  const containerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Обработчики свайпа
  const handlePointerDown = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setStartX(x);
    setTranslateX(0);
  };

  const handlePointerMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || startX == null) return;
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = x - startX;
    setTranslateX(diff);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const containerWidth = containerRef.current?.clientWidth || 0;
    const threshold = containerWidth * 0.2; // 20% ширины для перелистывания

    if (Math.abs(translateX) > threshold) {
      if (translateX < 0) handleNext();
      else handlePrev();
    }
    // сбрасываем translateX
    setTranslateX(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validVideos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < validVideos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Заголовок ролика */}
      <h2 className="text-md font-semibold text-center max-w-sm px-2">
        {video.title}
      </h2>

      {/* iframe (сам плеер). Под ним — overlay для свайпа. */}
      <div
        ref={containerRef}
        className="relative w-[90vw] max-w-[600px] aspect-video bg-gray-200"
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        {/* 
          Overlay поверх iframe для свайпа.
          Пока isDragging = true, overlay заним. 100% площади.
          Когда isDragging = false — overlay «прозрачен» для кликов (pointer-events: none).
        */}
        <div
          className="absolute inset-0"
          style={{
            // overlay видим только если пользователь «держит» палец/мышь
            pointerEvents: isDragging ? 'auto' : 'none',
            background: 'rgba(0,0,0,0)', // прозрачный фон
            touchAction: 'none', // отключить жесты браузера
            // сдвиг при свайпе
            transform: `translateX(${translateX}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          // Touch-события
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          // Mouse-события
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={() => isDragging && handlePointerUp()}
        />
      </div>

      {/* Кнопки управления */}
      <div className="flex space-x-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Next
        </button>
      </div>

      {/* Номер ролика / всего */}
      <p className="text-sm text-gray-500">
        Video {safeIndex + 1} / {validVideos.length}
      </p>
    </div>
  );
}
