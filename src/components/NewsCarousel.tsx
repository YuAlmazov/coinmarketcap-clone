'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

// Импорт базовых стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// Импортируем функцию, чтобы на клиенте загрузить новости
import { getLatestNews, CryptoNewsArticle } from '../../services/news';

/**
 * Скелетная карточка (Skeleton) имитирует контент новости.
 * На мобильном (<640px) отображаем 1 шт, на больших экранах — 3 шт.
 */
function SkeletonNewsCard() {
  return (
    <div
      className="
        p-4 bg-white rounded-xl shadow-md 
        transition-transform duration-300 
        hover:scale-105
        animate-pulse
      "
    >
      {/* Имитируем будущее изображение */}
      <div className="w-full h-52 bg-gray-200 rounded-md mb-3" />
      {/* Имитируем заголовок (полоса) */}
      <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2" />
      {/* Имитируем текст (полоса) */}
      <div className="h-3 bg-gray-200 rounded-md w-5/6 mb-2" />
      {/* Имитируем ещё одну полосу (чуть короче) */}
      <div className="h-3 bg-gray-200 rounded-md w-1/3" />
    </div>
  );
}

const NewsCarousel: React.FC = () => {
  // Состояние новостей. undefined => «ещё не загружены»
  const [news, setNews] = useState<CryptoNewsArticle[] | undefined>(undefined);

  // Определяем ширину экрана, чтобы понять, мобильный ли режим
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Загружаем новости на клиенте
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getLatestNews();
        if (isMounted) {
          setNews(data);
        }
      } catch (err) {
        console.error('Ошибка при загрузке новостей:', err);
        if (isMounted) {
          setNews([]);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const isMobile = windowWidth && windowWidth < 640;

  // Если `news` === undefined => ещё не загружено: показываем скелет
  if (news === undefined) {
    const skeletonCount = isMobile ? 1 : 3;
    return (
      <div className="w-full mx-auto mt-8 px-3 sm:px-6">
        <h2 className="text-2xl font-semibold mb-5 text-center">News</h2>
        <div
          className={`
            grid gap-4 
            ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}
          `}
        >
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <SkeletonNewsCard key={idx} />
          ))}
        </div>
      </div>
    );
  }

  // Если массив загружен, но пуст
  if (news.length === 0) {
    return <div className="text-center mt-6">Нет новостей для отображения.</div>;
  }

  // Иначе (данные загружены и есть хотя бы 1 новость) => полноценная карусель
  return (
    <div className="w-full mx-auto mt-8 px-3 sm:px-6">
      <h2 className="text-2xl font-semibold mb-5 text-center">News</h2>

      {/* Стили для стрелок навигации в стиле «Apple-модерн» */}
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          top: auto;
          bottom: 10px !important;
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.7);
          color: #000;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s, color 0.3s;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background-color: rgba(255, 255, 255, 1);
          color: #007aff;
        }
        @media (min-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            bottom: 20px !important;
          }
        }
      `}</style>

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={16}
        slidesPerView={1}
        navigation
        scrollbar={{ draggable: true }}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 24,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
      >
        {news.map((article) => (
          <SwiperSlide key={article.id}>
            <div
              className="
                p-4 bg-white rounded-xl shadow-md 
                transition-transform duration-300 
                hover:scale-105
              "
            >
              <img
                src={article.imageurl}
                alt={article.title}
                className="w-full max-h-52 object-cover rounded-md mb-3"
              />
              <h3 className="text-md font-semibold mb-1">
                {article.title}
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                {article.body?.slice(0, 80)}...
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm font-medium underline"
              >
                Read more
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default NewsCarousel;
