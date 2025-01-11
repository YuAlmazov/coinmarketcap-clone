import { notFound } from 'next/navigation';
import React from 'react';
import ExchangesTable, { ExchangeData } from '@/components/ExchangesTable';

/**
 * Запрашиваем общее описание всех бирж:
 * GET /data/exchanges/general
 *
 * Отключаем кэширование (cache: 'no-store'),
 * чтобы не было ошибок "items over 2MB can not be cached".
 */
async function fetchExchanges() {
  const res = await fetch('https://min-api.cryptocompare.com/data/exchanges/general', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch /data/exchanges/general');
  }

  const json = await res.json();
  if (!json?.Data) {
    // Если поле Data отсутствует, возвращаем пустой массив
    return [];
  }

  // Пример ответа (упрощён):
  // {
  //   "Data": {
  //     "2431": {
  //       "Id": "2431",
  //       "Name": "Bitstamp",
  //       "AffiliateURL": "https://www.bitstamp.net/",
  //       "LogoUrl": "/media/37748052/bitstamp.png",
  //       "Country": "United Kingdom",
  //       "GradePoints": 83.3,
  //       "Grade": "AA",
  //       ...
  //     },
  //     "2434": {
  //       "Id": "2434",
  //       "Name": "Bittrex",
  //       "AffiliateURL": "...",
  //       ...
  //     },
  //     ...
  //   }
  // }

  const rawEntries = Object.entries(json.Data) as [string, any][];

  // Мапим в ExchangeData
  const list: ExchangeData[] = rawEntries.map(([key, ex]) => ({
    Id: ex.Id || key,
    Name: ex.Name || ex.InternalName || 'Unknown Exchange',
    ImageUrl: ex.LogoUrl || '',
    Country: ex.Country || '',
    Grade: ex.Grade || '',
    GradePoints: ex.GradePoints || 0,
    AffiliateURL: ex.AffiliateURL || '',
  }));

  return list;
}

export default async function ExchangesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  try {
    // 1) Загружаем все биржи
    const data = await fetchExchanges();

    // Если массив пуст — отдаём 404
    if (!data.length) {
      notFound();
    }

    // 2) «Серверная пагинация» (как в Coins) — по 100 штук на страницу
    const page = searchParams?.page ? +searchParams.page : 1; // Текущая страница (1-based)
    const _pageIndex = page - 1; // 0-based
    const pageSize = 100;

    const startIndex = _pageIndex * pageSize;
    const endIndex = startIndex + pageSize;

    // Массив для текущей страницы
    const serverSideExchanges = data.slice(startIndex, endIndex);

    // Общее число страниц
    const totalPages = Math.ceil(data.length / pageSize);

    return (
      <main className="py-4">
        <h1 className="text-center text-2xl font-bold my-4">Exchanges List</h1>

        <div className="max-w-7xl mx-auto">
          {/* 
            Передаём:
            - serverSideExchanges как "exchanges" (эта страница)
            - весь список (data) как allExchanges (для поиска / избранного)
            - totalPages 
          */}
          <ExchangesTable
            exchanges={serverSideExchanges}
            allExchanges={data}
            total={totalPages}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    notFound();
  }
}
