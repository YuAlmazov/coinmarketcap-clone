// coinmarketcap-clone/components/NewsCarousel.tsx

'use client'; // Если используете Next.js 13+ ()
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

// Импорт базовых стилей Swiper (обязательно)
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// Импорт вашего типа новостей, если он лежит в services/news.ts
import { CryptoNewsArticle } from '../../services/news';

interface NewsCarouselProps {
  news: CryptoNewsArticle[];
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ news }) => {
  // Если новостей нет, просто отобразить сообщение
  if (!news || news.length === 0) {
    return <div className="text-center mt-6">Нет новостей для отображения.</div>;
  }

  return (
    <div className="w-full mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">News</h2>
      
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={24}          // Отступы между слайдами
        slidesPerView={1}          // По умолчанию: 1 слайд
        navigation                 // Стрелки переключения
        
        scrollbar={{ draggable: true }}  // Полоса прокрутки (необязательно)
        breakpoints={{
          // При 640px и выше
          640: {
            slidesPerView: 1,
          },
          // При 768px и выше
          768: {
            slidesPerView: 2,
          },
          // При 1024px и выше
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {news.map((article) => (
          <SwiperSlide key={article.id}>
            <div 
              className="
                p-4 bg-white rounded-md shadow-md 
                transition-transform duration-300 
                hover:scale-105
              "
            >
              <img
                src={article.imageurl}
                alt={article.title}
                className="w-full h-36 object-cover rounded mb-2"
              />
              <h3 className="text-md font-semibold mb-1">{article.title}</h3>
              <p className="text-sm text-gray-700 mb-2">
                {article.body?.slice(0, 80)}...
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm underline"
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