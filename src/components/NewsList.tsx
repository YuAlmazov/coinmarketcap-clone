// components/NewsList.tsx
import React from 'react';
import { CryptoNewsArticle } from '../../services/news';

interface NewsListProps {
  news: CryptoNewsArticle[];
}

const NewsList: React.FC<NewsListProps> = ({ news }) => {
  // Показываем только первые 3 новости (если нужно последние 3, используйте .slice(-3))
  const limitedNews = news.slice(0, 3);

  if (!limitedNews || limitedNews.length === 0) {
    return <div className="text-center mt-6">Нет новостей для отображения.</div>;
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-xl font-bold mb-4">Криптовалютные новости</h2>

      {/* Блок-обёртка для 3 карточек */}
      <div className="flex flex-wrap justify-center gap-6">
        {limitedNews.map((article) => (
          <div
            key={article.id}
            className="
              bg-white p-4 w-64 
              rounded-md shadow-md 
              transition-transform duration-300 
              hover:scale-105 
              hover:shadow-xl
            "
          >
            {/* Изображение (уменьшаем пропорционально) */}
            <img
              src={article.imageurl}
              alt={article.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            {/* Заголовок */}
            <h3 className="text-md font-semibold mb-1">{article.title}</h3>
            {/* Описание (только первые 80 символов, например) */}
            <p className="text-sm text-gray-700 mb-2">
              {article.body?.slice(0, 80)}...
            </p>
            {/* Ссылка */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm underline"
            >
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsList;