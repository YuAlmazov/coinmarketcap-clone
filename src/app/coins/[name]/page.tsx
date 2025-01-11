import CoinChart from '@/components/CoinChart';
import { LineChart } from '@mantine/charts';
import dayjs from 'dayjs';
import React from 'react';

// Любые URL / ссылки оставляем как есть
// https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=30&aggregate=3&e=CCCAGG
// https://min-api.cryptocompare.com/data/v2/histohour?fsym=XMR&tsym=USD&limit=24&aggregate=3&e=CCCAGG
// https://min-api.cryptocompare.com/data/v2/histominute?aggregate=1&e=CCCAGG&fsym=BTC&limit=1450&tryConversion=false&tsym=USD

// Функция подгрузки данных
const fetchCoin = async (name: string) => {
  const res = await fetch(
    `https://min-api.cryptocompare.com/data/v2/histominute?aggregate=10&e=CCCAGG&fsym=${name}&limit=144&tryConversion=false&tsym=USD`
  );

  if (!res.ok) {
    // Бросаем ошибку, чтобы "try/catch" выше поймал её
    throw new Error(`Failed to fetch coin data for ${name}`);
  }

  const coin = await res.json();
  return coin;
};

export default async function Coin({
	params: { name },
  }: {
	params: { name: string };
  }) {
	try {
	  // Подгружаем данные
	  const data = await fetchCoin(name);
  
	  // Безопасная проверка и преобразование данных
	  const rawArray = data?.Data?.Data;
	  const chartData = Array.isArray(rawArray)
		? rawArray.map((item: any) => ({
			date: dayjs(item.time * 1000).format('HH:mm'),
			Price: item.high,
		  }))
		: [];
  
	  // Если данных нет — отображаем «красивое» сообщение
	  if (!chartData.length) {
		return (
		  <div className="max-w-4xl mx-auto my-8 p-6 text-center bg-gray-50 border border-gray-200 rounded shadow-sm">
			<h2 className="text-xl font-semibold mb-2">Нет данных</h2>
			<p className="text-gray-600">
			  К сожалению, для монеты <strong>{name}</strong> нет данных для отображения графика.
			</p>
		  </div>
		);
	  }
  
	  // Если данные есть — рендерим график
	  return (
		<div className="max-w-4xl m-auto">
		  <CoinChart data={chartData} />
		</div>
	  );
	} catch (error) {
	  console.error('Ошибка при загрузке данных:', error);
	  // При возникновении ошибки — тоже выводим сообщение
	  return (
		<div className="max-w-4xl mx-auto my-8 p-6 text-center bg-red-50 border border-red-200 rounded shadow-sm">
		  <h2 className="text-xl font-semibold mb-2 text-red-700">Ошибка!</h2>
		  <p className="text-red-600">
			Не удалось загрузить данные для монеты <strong>{name}</strong>.
		  </p>
		</div>
	  );
	}
  }

