/**
 * Файл: src\app\page.tsx
 */
import { notFound } from 'next/navigation';
import dayjs from 'dayjs';
import LogoPanel from '@/components/LogoPanel';
import CoinsTable from '@/components/CoinsTable';
import LitecoinSingleTable from '@/components/LitecoinSingleTable';
import { CoinsResponse } from '@/types/coin';

// ----------------------
// Вспомогательные функции
// ----------------------
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

export default async function Page({
  searchParams: { page },
}: {
  searchParams: { page?: string };
}) {
  const _page = page ? +page - 1 : 0;

  try {
    // 1. Данные для таблицы монет (серверная пагинация)
    const data = await fetchCoins(_page);

    // 2. Все монеты (для поиска)
    const allCoins = await fetchAllCoins();

    // Если нет базовых данных — 404
    if (!data?.Data?.length) {
      notFound();
    }

    // ---------------------
    // Выделяем Litecoin
    // ---------------------
    let litecoinData = null;
    const ltcIndex = data.Data.findIndex((coin) => {
      const name = coin.CoinInfo.Name.toLowerCase();
      const full = coin.CoinInfo.FullName.toLowerCase();
      return name === 'ltc' || full.includes('litecoin');
    });

    if (ltcIndex > -1) {
      // Вырезаем LTC из массива, чтобы он не мешал CoinsTable
      [litecoinData] = data.Data.splice(ltcIndex, 1);
    }

    // ----------------------------------------------
    // Рендерим
    // ----------------------------------------------
    return (
      <main className="py-1">
        {/* 1) Логотип + анимация */}
        <LogoPanel />

        {/* 2) Отдельная табличка LTC (если нашлась) */}
        <div className="max-w-7xl m-auto">
          <LitecoinSingleTable initialLitecoinData={litecoinData} />
        </div>

        {/* 3) Общая таблица монет */}
        <div className="max-w-7xl m-auto">
          <CoinsTable
            coins={data.Data} // уже без LTC
            allCoins={allCoins}
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
