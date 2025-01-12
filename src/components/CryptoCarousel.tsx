// ПУТЬ: src/components/CryptoCarousel.tsx
'use client';

import React, { useState } from 'react';

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

/**
 * Компонент «карусель»: показывает 1 ролик по currentIndex,
 * стрелками «Prev»/«Next» переключается, *пропуская* «Invalid link».
 */
export default function CryptoCarousel({
  videos,
}: {
  videos: { title: string; watchLink: string }[];
}) {
  // 1) Фильтруем, убираем ролики с пустым videoId
  const validVideos = videos.filter((v) => {
    const videoId = extractVideoId(v.watchLink);
    return videoId !== '';
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Если после фильтра ничего не осталось
  if (!validVideos.length) {
    return <div>No valid videos found.</div>;
  }

  // Безопасный индекс: вдруг currentIndex вышел за границу
  const safeIndex = Math.max(0, Math.min(currentIndex, validVideos.length - 1));
  const video = validVideos[safeIndex];
  // Уже точно не пустая, т.к. мы отфильтровали
  const videoId = extractVideoId(video.watchLink);

  // Переключение «Prev»
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validVideos.length - 1));
  };

  // Переключение «Next»
  const handleNext = () => {
    setCurrentIndex((prev) => (prev < validVideos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Заголовок ролика */}
      <h2 className="text-md font-semibold text-center max-w-sm px-2">
        {video.title}
      </h2>

      {/* iframe (сам плеер) */}
      <div className="w-[90vw] max-w-[600px] aspect-video bg-gray-200">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allowFullScreen
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
