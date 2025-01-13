// src\components\LitecoinSingleTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { CoinsData } from '@/types/coin';
import { Table } from '@mantine/core';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
type Props = {
  litecoinData: CoinsData | null;
  
};

/**
 * Отдельная таблица (без заголовков столбцов) 
 * для отображения именно Litecoin
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
    // чтобы клик по кнопке не вызывал переход куда-то ещё
    e.stopPropagation();
    setLtcLiked((prev) => !prev);
  };

  if (!litecoinData) {
    return null; // Если по какой-то причине нет данных по LTC
  }


  // DISPLAY?.USD — могут быть undefined, поэтому безопасно проверяем
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
      <Table striped highlightOnHover>
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
                className="mr-2 text-red-500 hover:scale-110 transition-transform"
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
                {litecoinData.CoinInfo.FullName}
                  
                {litecoinData.CoinInfo.Name}
                
              </div>
            </Table.Td>

            {/* Цена */}
            <Table.Td className="px-2 py-2 text-right">{price}</Table.Td>

            {/* 1h% */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">{hour1Change}</Table.Td>

            {/* 24h% */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">{hour24Change}</Table.Td>

            {/* Market Cap */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">{marketCap}</Table.Td>

            {/* Volume (24h) */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">{volume24}</Table.Td>

            {/* Circulating Supply */}
            <Table.Td className="px-2 py-2 text-right hidden sm:table-cell">{supply}</Table.Td>

            {/* Last 7 Days (sparkline) */}
            <Table.Td className="px-2 py-2">
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
