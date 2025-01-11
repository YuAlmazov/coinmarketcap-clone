// app/news/page.tsx
import { notFound } from 'next/navigation';
import React from 'react';
import { getLatestNews } from '../../../services/news';
import NewsCarousel from '@/components/NewsCarousel';

export default async function NewsPage() {
  // Загружаем/получаем новости (на серверной стороне)
  const news = await getLatestNews();

  // Если массив пустой, вызывать notFound() или показать сообщение
  if (!news || news.length === 0) {
    // Можно так, можно вернуть <div>Нет новостей</div> — на ваше усмотрение
    // notFound();
    return <div className="text-center py-8">Нет новостей для отображения.</div>;
  }

  return (
    <main className="py-1">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">News</h1>
        {/* Отрисовываем карусель или список */}
        <NewsCarousel />
      </div>
    </main>
  );
}
