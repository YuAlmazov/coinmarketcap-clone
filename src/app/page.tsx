/** 
 * Файл: app/coins/[name]/page.tsx
 */
import { notFound } from 'next/navigation';
import dayjs from 'dayjs'; // Не забудьте установить пакет dayjs, если ещё не установлен
import LogoPanel from '@/components/LogoPanel';
import CoinsTable from '@/components/CoinsTable';
import { CoinsResponse } from '@/types/coin';

// УБРАЛИ импорт getLatestNews и любую связанную логику
// import { getLatestNews } from '../../services/news';

async function fetchCoins(page: number = 0, limit: number = 100) {
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/top/totaltoptiervolfull?limit=${limit}&tsym=USD&page=${page}`
  );
  const coins = await res.json();
  return coins as CoinsResponse;
}

async function fetchAllCoins() {
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
}

// Допустим, есть функция fetchCoin, которая подгружает детальные данные конкретной монеты
async function fetchCoin(name: string) {
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${name}&tsym=USD&limit=24`
  );
  if (!res.ok) {
    throw new Error('Failed to fetch coin details');
  }
  return res.json();
}

export default async function Page({
  params: { name },
  searchParams: { page },
}: {
  params: { name: string };
  searchParams: { page?: string };
}) {
  const _page = page ? +page - 1 : 0;

  try {
    // Данные для таблицы монет (пагинация)
    const data = await fetchCoins(_page);
    const allCoins = await fetchAllCoins();

    // Если нет базовых данных по монетам — 404
    if (!data?.Data?.length) {
      notFound();
    }

    // Загружаем данные конкретной монеты для графика (если нужно)
    const coinDetails = await fetchCoin(name);

    // Безопасное извлечение данных:
    // 1) Проверяем, что coinDetails вообще есть
    // 2) Проверяем, что coinDetails.Data существует
    // 3) Проверяем, что coinDetails.Data.Data — это массив
    const rawArray = coinDetails?.Data?.Data;
    let chartData: { date: string; Price: number }[] = [];
    if (Array.isArray(rawArray)) {
      chartData = rawArray.map((item: any) => ({
        date: dayjs(item.time * 1000).format('HH:mm'),
        Price: item.high,
      }));
    }

    console.log('Chart data:', chartData);

    return (
      <main className="py-1">
        <LogoPanel />

        <div className="max-w-7xl m-auto">
          {/* Пробрасываем данные в таблицу */}
          <CoinsTable
            coins={data.Data}         // текущая страница (серверная пагинация)
            allCoins={allCoins}       // всё множество монет (для поиска)
            total={Math.ceil(data.MetaData.Count / 100)}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
