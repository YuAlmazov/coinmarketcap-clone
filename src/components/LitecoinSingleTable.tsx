'use client';

import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { CoinsData } from '@/types/coin';
import { Table } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Props = {
  litecoinData: CoinsData | null;
};

/**
 * Отдельная таблица (без заголовков столбцов) 
 * для отображения именно Litecoin.
 * Адаптировано для мобильных устройств:
 * - На узких экранах (< 640px) видны только:
 *   сердечко, логотип + название, цена, график.
 */
export default function LitecoinSingleTable({ litecoinData }: Props) {
  const [ltcLiked, setLtcLiked] = useState(false);
  const router = useRouter();

  // Считываем состояние «сердечка» для LTC из localforage
  useEffect(() => {
    localforage.getItem<boolean>('ltcHeart').then((val) => {
      if (typeof val === 'boolean') {
        setLtcLiked(val);
      }
    });
  }, []);

  // Сохраняем состояние «сердечка» в localforage при каждом изменении
  useEffect(() => {
    localforage.setItem('ltcHeart', ltcLiked);
  }, [ltcLiked]);

  const toggleHeart = (e: React.MouseEvent) => {
    // чтобы клик по иконке не вызывал переход
    e.stopPropagation();
    setLtcLiked((prev) => !prev);
  };

  if (!litecoinData) {
    return null; // Если по какой-то причине нет данных по LTC
  }

  // Достаём данные (безопасно проверяем)
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
    <div className="mb-8 overflow-x-auto">
      <Table striped highlightOnHover className="w-full table-auto">
        <Table.Tbody>
          <Table.Tr
            key={litecoinData.CoinInfo.Id}
            className={rowClass}
            onClick={() => {
              // Переход на страницу монеты без скролла
              router.push(`/coins/${litecoinData.CoinInfo.Name}`, { scroll: false });
            }}
          >
            {/* Слева — иконка сердечка */}
            <Table.Td
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-2"
            >
              <button
                onClick={toggleHeart}
                className="mr-2 text-red-500 hover:scale-110 transition-transform"
              >
                {ltcLiked ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
              </button>
            </Table.Td>

            {/* Логотип + название (всегда видим) */}
            <Table.Td className="px-2 py-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={`https://www.cryptocompare.com/${litecoinData.CoinInfo.ImageUrl}`}
                  alt={litecoinData.CoinInfo.Name}
                  width={24}
                  height={24}
                />
                <span>{litecoinData.CoinInfo.FullName}</span>
                <span className="text-gray-800">
                  {litecoinData.CoinInfo.Name}
                </span>
              </div>
            </Table.Td>

            {/* Цена (всегда видим) */}
            <Table.Td className="px-2 py-2 text-right">
              {price}
            </Table.Td>

            {/* hour1Change — скрываем на мобильных (показываем только >=640px) */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {hour1Change}
            </Table.Td>

            {/* hour24Change — скрываем на мобильных */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {hour24Change}
            </Table.Td>

            {/* Market Cap — скрываем на мобильных */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {marketCap}
            </Table.Td>

            {/* Volume (24h) — скрываем на мобильных */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {volume24}
            </Table.Td>

            {/* Circulating Supply — скрываем на мобильных */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">
              {supply}
            </Table.Td>

            {/* График (спарклайн) — показываем всегда */}
            <Table.Td className="px-2 py-2">
              <Image
                src={sparkChartUrl}
                alt="Sparkline"
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
