// ПУТЬ: src/app/cryptovideos/page.tsx

import React from 'react';
import puppeteer from 'puppeteer';
import CryptoCarousel from '../../components/CryptoCarousel';

/**
 * Запускаем Puppeteer, парсим YouTube по "crypto currency",
 * возвращаем последние 10 роликов (title, watchLink).
 */
async function fetchTopCryptoVideos(limit = 10) {
  const browser = await puppeteer.launch({
    headless: true, // или true, если у вас более старая версия Puppeteer
    
  });

  try {
    const page = await browser.newPage();
    // Примерный URL поиска по "crypto currency" (можно изменить фильтр)
    await page.goto('https://www.youtube.com/results?search_query=crypto+currency&sp=CAI%253D', {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('ytd-video-renderer');

    const videos = await page.evaluate((maxItems) => {
      const nodeList = document.querySelectorAll('ytd-video-renderer');
      const arr: { title: string; watchLink: string }[] = [];

      nodeList.forEach((node, i) => {
        if (i >= maxItems) return;

        const titleEl = node.querySelector('#video-title');
        const rawHref = titleEl?.getAttribute('href') || '';
        const title = titleEl?.textContent?.trim() || 'No title';

        // Формируем рабочую ссылку
        const link = rawHref.startsWith('http')
          ? rawHref
          : `https://www.youtube.com${rawHref}`;

        arr.push({
          title,
          watchLink: link,
        });
      });

      return arr;
    }, limit);

    return videos;
  } finally {
    await browser.close();
  }
}

export default async function CryptoVideosPage() {
  // Парсим YouTube (серверный RSC)
  const videos = await fetchTopCryptoVideos(10);

  return (
    <main className="p-4">
      <h1 className="text-center text-2xl font-bold my-4">
        Crypto Videos Carousel
      </h1>

      <div className="max-w-4xl mx-auto">
        {/* Передаём полученные ролики в клиентский компонент */}
        <CryptoCarousel videos={videos} />
      </div>
    </main>
  );
}

// Чтобы всегда парсить «свежие» данные, можно отключить кэш:
export const revalidate = 0;
