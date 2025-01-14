'use client';

import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { CoinsData } from '@/types/coin';
import { Table } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * ВАЖНО:
 * Ожидается, что в пропсы придёт начальный объект Litecoin (как в вашем исходном коде).
 * Мы назвали его initialLitecoinData, чтобы было ясно, что дальше мы будем "проживать"
 * его в собственном локальном стейте (litecoinData).
 */
type Props = {
  initialLitecoinData: CoinsData | null;
  
};

/**
 * Отдельная таблица (без заголовков столбцов)
 * для отображения именно Litecoin, с периодическим рефетчем данных.
 */
export default function LitecoinSingleTable({ initialLitecoinData }: Props) {
  // *** Создаём локальный стейт для данных LTC,
  //     чтобы в дальнейшем обновлять их по таймеру
  const [litecoinData, setLitecoinData] = useState<CoinsData | null>(
    initialLitecoinData
  );

  const [ltcLiked, setLtcLiked] = useState(false);
  const router = useRouter();

  // -------------------------
  // Считываем состояние «сердечка» для LTC из localforage
  // -------------------------
  useEffect(() => {
    localforage.getItem<boolean>('ltcHeart').then((val) => {
      if (typeof val === 'boolean') {
        setLtcLiked(val);
      }
    });
  }, []);

  // -------------------------
  // Сохраняем состояние «сердечка» в localforage при каждом изменении
  // -------------------------
  useEffect(() => {
    localforage.setItem('ltcHeart', ltcLiked);
  }, [ltcLiked]);

  // -------------------------
  // Периодический рефетч данных LTC каждые 30 сек (пример)
  // -------------------------
  useEffect(() => {
    const fetchLitecoinData = async () => {
      try {
        // Тот же API, который у вас используется в page.tsx для остальных монет.
        // Но запрашиваем только LTC (если нужно совсем как top list — тогда меняйте).
        const res = await fetch(
          'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=LTC&tsyms=USD'
        );
        const json = await res.json();

        // Делаем преобразование в вашу структуру CoinsData
        // (минимально, чтобы основные поля отобразились корректно).
        const newData: CoinsData = {
          CoinInfo: {
            Id: 'LTC-refetched', // условный Id
            Name: 'LTC',
            FullName: 'Litecoin',
            // Можно попробовать достать url иконки из json.Data.LTC.CoinInfo, 
            // но CryptoCompare при точечных запросах иногда возвращает другой формат
            // В качестве примера используем уже имеющийся ImageUrl:
            ImageUrl: initialLitecoinData?.CoinInfo?.ImageUrl ?? '/media/37746243/ltc.png',
            Internal: '',
            Url: '',
            Algorithm: '',
            ProofType: '',
            Rating: {
              Weiss: {
                Rating: '',
                TechnologyAdoptionRating: '',
                MarketPerformanceRating: ''
              }
            },
            NetHashesPerSecond: 0,
            BlockNumber: 0,
            BlockTime: 0,
            BlockReward: 0,
            AssetLaunchDate: new Date(),
            MaxSupply: 0,
            Type: 0
          },
          DISPLAY: {
            USD: {
              PRICE: json?.DISPLAY?.LTC?.USD?.PRICE ?? '',
              CHANGEPCTHOUR: json?.DISPLAY?.LTC?.USD?.CHANGEPCTHOUR ?? '',
              CHANGEPCT24HOUR: json?.DISPLAY?.LTC?.USD?.CHANGEPCT24HOUR ?? '',
              MKTCAP: json?.DISPLAY?.LTC?.USD?.MKTCAP ?? '',
              TOTALVOLUME24HTO: json?.DISPLAY?.LTC?.USD?.TOTALVOLUME24HTO ?? '',
              SUPPLY: json?.DISPLAY?.LTC?.USD?.SUPPLY ?? '',
              FROMSYMBOL: '',
              TOSYMBOL: undefined,
              MARKET: undefined,
              LASTMARKET: undefined,
              TOPTIERVOLUME24HOUR: '',
              TOPTIERVOLUME24HOURTO: '',
              LASTTRADEID: '',
              LASTUPDATE: undefined,
              LASTVOLUME: '',
              LASTVOLUMETO: '',
              VOLUMEHOUR: '',
              VOLUMEHOURTO: '',
              OPENHOUR: '',
              HIGHHOUR: '',
              LOWHOUR: '',
              VOLUMEDAY: '',
              VOLUMEDAYTO: '',
              OPENDAY: '',
              HIGHDAY: '',
              LOWDAY: '',
              VOLUME24HOUR: '',
              VOLUME24HOURTO: '',
              OPEN24HOUR: '',
              HIGH24HOUR: '',
              LOW24HOUR: '',
              CHANGE24HOUR: '',
              CHANGEDAY: '',
              CHANGEPCTDAY: '',
              CHANGEHOUR: '',
              CONVERSIONTYPE: undefined,
              CONVERSIONSYMBOL: undefined,
              CONVERSIONLASTUPDATE: undefined,
              MKTCAPPENALTY: undefined,
              CIRCULATINGSUPPLY: '',
              CIRCULATINGSUPPLYMKTCAP: '',
              TOTALVOLUME24H: '',
              TOTALTOPTIERVOLUME24H: '',
              TOTALTOPTIERVOLUME24HTO: '',
              IMAGEURL: ''
            },
          },
        };

        setLitecoinData(newData);
      } catch (error) {
        console.error('Ошибка при рефетче LTC:', error);
      }
    };

    // *** Запускаем интервал
    const intervalId = setInterval(fetchLitecoinData, 5_000);

    // *** Один раз вызываем при монтировании, чтобы не ждать 30 секунд
    fetchLitecoinData();

    // *** Чистим интервал при размонтивании
    return () => clearInterval(intervalId);
  }, [initialLitecoinData]);

  // -------------------------
  // Хэндлер клика по сердечку
  // -------------------------
  const toggleHeart = (e: React.MouseEvent) => {
    // Чтобы клик по кнопке не вызывал переход куда-то ещё
    e.stopPropagation();
    setLtcLiked((prev) => !prev);
  };

  // Если по какой-то причине данных нет — ничего не рендерим
  if (!litecoinData) {
    return null;
  }

  // Достаём поля
  const price = litecoinData.DISPLAY?.USD.PRICE ?? '';
  const hour1Change = litecoinData.DISPLAY?.USD.CHANGEPCTHOUR ?? '';
  const hour24Change = litecoinData.DISPLAY?.USD.CHANGEPCT24HOUR ?? '';
  const marketCap = litecoinData.DISPLAY?.USD.MKTCAP ?? '';
  const volume24 = litecoinData.DISPLAY?.USD.TOTALVOLUME24HTO ?? '';
  const supply = litecoinData.DISPLAY?.USD.SUPPLY ?? '';
  const sparkChartUrl = `https://images.cryptocompare.com/sparkchart/${litecoinData.CoinInfo.Name}/USD/latest.png`;

  // Стили аналогичны тому, как выделялась строка LTC в CoinsTable
  const rowClass = `
    bg-gradient-to-r cursor-pointer from-purple-600 to-pink-100 text-white font-semibold
    transition-all duration-300 
    hover:scale-[1.02] hover:shadow-xl
  `;

  return (
    <div className="mb-8">
      {/* Добавили w-full, чтобы таблица растягивалась на всю ширину */}
      <Table striped highlightOnHover className="w-full">
        <Table.Tbody>
          <Table.Tr
            key={litecoinData.CoinInfo.Id}
            className={rowClass}
            onClick={() => {
              // Переход на страницу монеты без скролла
              router.push(`/coins/${litecoinData.CoinInfo.Name}`, { scroll: false });
            }}
          >
            {/* Слева — иконка сердечка + логотип LTC */}
            <Table.Td onClick={(e) => e.stopPropagation()} className="px-2 py-2">
              <button
                onClick={toggleHeart}
                className="mr-2 text-red-500 hover:scale-110 transition-transform position-center"
              >
                {ltcLiked ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
              </button>
            </Table.Td>

            <Table.Td className="px-2 py-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={`https://www.cryptocompare.com/${litecoinData.CoinInfo.ImageUrl}`}
                  alt={litecoinData.CoinInfo.Name}
                  width={24}
                  height={24}
                />
                {litecoinData.CoinInfo.FullName} &nbsp;
                {litecoinData.CoinInfo.Name}
              </div>
            </Table.Td>

            {/* Цена */}
            <Table.Td className="px-2 py-2 text-right">{price}</Table.Td>

            {/* 1h% */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {hour1Change}
            </Table.Td>

            {/* 24h% */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {hour24Change}
            </Table.Td>

            {/* Market Cap */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {marketCap}
            </Table.Td>

            {/* Volume (24h) */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {volume24}
            </Table.Td>

            {/* Circulating Supply */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {supply}
            </Table.Td>

            {/* Последнюю ячейку делаем без правого паддинга, чтобы убрать пустое место */}
            <Table.Td className="py-2 pr-0">
              <Image
                src={sparkChartUrl}
                alt=""
                height={35}
                width={150}
              />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </div>
  );
}
