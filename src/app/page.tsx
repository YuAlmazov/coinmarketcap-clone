import CoinsTable from '@/components/CoinsTable';
import { CoinsResponse } from '@/types/coin';
import { notFound } from 'next/navigation';

const fetchCoins = async (page: number = 0, limit: number = 100) => {
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/top/totaltoptiervolfull?limit=${limit}&tsym=USD&page=${page}`
  );

  const coins = await res.json();
  return coins as CoinsResponse;
};

// Допустим, если у вас есть функция fetchAllCoins, она может выглядеть так:
const fetchAllCoins = async () => {
  // Сначала страница №0
  const first = await fetchCoins(0);
  if (!first || !first.Data) return [];

  const count = first.MetaData.Count; // всего монет
  const pagesCount = Math.ceil(count / 100);
  let allData = [...first.Data];

  // Цикл по остальным страницам
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
    // 1) Получаем данные для текущей страницы
    const data = await fetchCoins(_page);
    // 2) (необязательно) Получаем все монеты, если нужно поиск по всему списку
    //    Если вы уже передаёте allCoins, то этот шаг не нужен.
    //    Пример:
    const allCoins = await fetchAllCoins();

    // Если нет данных — 404
    if (!data?.Data?.length) {
      notFound();
    }

    return (
      <main className="py-8">
        <div className="max-w-7xl m-auto">
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
