import CoinsTable from '@/components/CoinsTable';
import { CoinsResponse } from '@/types/coin';
import { notFound } from 'next/navigation';
// ❌ УБИРАЕМ импорт getLatestNews (и всю логику загрузки news)
// import { getLatestNews } from '../../services/news';

import NewsCarousel from '@/components/NewsCarousel';

const fetchCoins = async (page: number = 0, limit: number = 100) => {
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/top/totaltoptiervolfull?limit=${limit}&tsym=USD&page=${page}`
  );

  const coins = await res.json();
  return coins as CoinsResponse;
};

const fetchAllCoins = async () => {
  const first = await fetchCoins(0);
  if (!first || !first.Data) return [];

  const count = first.MetaData.Count; // всего монет
  const pagesCount = Math.ceil(count / 100);
  let allData = [...first.Data];

  for (let i = 1; i < pagesCount; i++) {
    const next = await fetchCoins(i);
    if (next.Data) {
      allData = allData.concat(next.Data);
    }
  }
  return allData;
};

export default async function Home({
  searchParams: { page },
}: {
  searchParams: { page?: string };
}) {
  const _page = page ? +page - 1 : 0;

  try {
    const data = await fetchCoins(_page);
    const allCoins = await fetchAllCoins();

    // Если нет данных — 404
    if (!data?.Data?.length) {
      notFound();
    }

    return (
      <main className="py-1">
        <div className="max-w-7xl m-auto">
          {/* Здесь мы больше НЕ передаём новости, а просто вызываем компонент NewsCarousel */}
          <NewsCarousel />
          <CoinsTable
            coins={data.Data} // текущая страница (серверная пагинация)
            allCoins={allCoins} // всё множество монет (для поиска)
            total={Math.ceil(data.MetaData.Count / 100)}
          />
        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}