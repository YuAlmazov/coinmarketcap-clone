'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

// Импорт базовых стилей Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import { CryptoNewsArticle } from '../../services/news';

interface NewsCarouselProps {
  news: CryptoNewsArticle[];
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ news }) => {
  // Если нет новостей, выводим сообщение
  if (!news || news.length === 0) {
    return <div className="text-center mt-6">Нет новостей для отображения.</div>;
  }

  return (
    <div className="w-full mx-auto mt-8 px-3 sm:px-6">
      <h2 className="text-2xl font-semibold mb-5 text-center">News</h2>

      {/*
        -- Внимание! Для стилизации стрелок Swiper (на мобильных) 
           используем глобальные классы .swiper-button-next и .swiper-button-prev.
           Можно написать их и в виде <style jsx global> блока (Next.js), 
           либо вынести в globals.css.
      */}
      <style jsx global>{`
        /* Стиль стрелок навигации в стиле Apple (модерн) */
        .swiper-button-next,
        .swiper-button-prev {
          top: auto;
          bottom: 10px !important;
          width: 2rem;
          height: 2rem;
          border-radius: 9999px; /* rounded-full */
          background-color: rgba(255, 255, 255, 0.7);
          color: #000;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

          transition: background-color 0.3s, color 0.3s;
        }

        /* Hover-эффект — Apple-синий */
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background-color: rgba(255, 255, 255, 1);
          color: #007aff; /* Apple-blue */
        }

        /* На более крупных экранах чуть смещаем вниз */
        @media (min-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            bottom: 20px !important;
          }
        }
      `}</style>

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={16}            // Отступы между слайдами
        slidesPerView={1}           // По умолчанию 1 слайд на маленьких
        navigation                  // Включаем стрелки переключения
        scrollbar={{ draggable: true }}  // Полоса прокрутки
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
                // Более чёткое изображение с ограничением по высоте
                className="w-full max-h-52 object-cover rounded-md mb-3"
              />
              <h3 className="text-md font-semibold mb-1">{article.title}</h3>
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
