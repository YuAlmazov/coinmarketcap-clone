'use client';

import React, { useEffect, useState } from 'react';
import { CoinsData } from '@/types/coin';
import {
  Pagination,
  Table,
  Checkbox,
  Popover,
  Drawer,
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Конфигурация колонок
const columnsConfig = [
  { id: 'star', label: '★', alwaysVisible: false },
  { id: 'index', label: '#', alwaysVisible: false },
  { id: 'name', label: 'Name', alwaysVisible: true },
  { id: 'price', label: 'Price', alwaysVisible: true },
  { id: 'hour1Change', label: '1h%', alwaysVisible: false },
  { id: 'hour24Change', label: '24h%', alwaysVisible: false },
  { id: 'marketCap', label: 'Market Cap', alwaysVisible: false },
  { id: 'volume24', label: 'Volume(24h)', alwaysVisible: false },
  { id: 'supply', label: 'Circulating Supply', alwaysVisible: false },
  { id: 'last7Days', label: 'Last 7 Days', alwaysVisible: false },
];

const MAX_MOBILE_COLUMNS = 4;

// Ключ в localStorage, под которым будем хранить выбранные пользователем колонки
const STORAGE_KEY = 'userSelectedColumns';

function ColumnHeader({
  col,
  isMobile,
  selectedColumns,
  handleToggleColumn,
  toggleDrawer,
}: {
  col: typeof columnsConfig[number];
  isMobile: boolean;
  selectedColumns: string[];
  handleToggleColumn: (colId: string) => void;
  toggleDrawer: () => void;
}) {
  const [opened, setOpened] = useState(false);

  const handleGearClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // чтобы не срабатывал onClick на <Table.Tr>
    if (isMobile) {
      toggleDrawer();
    } else {
      setOpened((prev) => !prev);
    }
  };

  return (
    <Popover
      width={200}
      position="bottom"
      withArrow
      opened={!isMobile && opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <div className="flex items-center justify-between w-full">
          <span>{col.label}</span>
          <button
            className="ml-1 text-gray-400 hover:text-gray-600"
            onClick={handleGearClick}
          >
            <IconSettings size={16} />
          </button>
        </div>
      </Popover.Target>

      {/* Поповер на ПК */}
      <Popover.Dropdown>
        <div className="flex flex-col gap-1">
          <div className="mb-1 font-semibold text-sm">Выбор колонок</div>
          {columnsConfig
            .filter((c) => !c.alwaysVisible)
            .map((c) => (
              <Checkbox
                key={c.id}
                label={c.label || '—'}
                checked={selectedColumns.includes(c.id)}
                onChange={() => handleToggleColumn(c.id)}
              />
            ))}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

export default function CoinsTable({
  coins,
  total,
}: {
  coins: CoinsData[];
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const page = pageParam ? +pageParam : 1;
  const start = page > 1 ? (page - 1) * 100 + 1 : page;

  // -------------------------
  //  Состояние выбранных колонок
  // -------------------------
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // При первом рендере пробуем загрузить из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromStorage = localStorage.getItem(STORAGE_KEY);
      if (fromStorage) {
        // Парсим JSON
        const parsed = JSON.parse(fromStorage) as string[];
        // Проверяем, что колонки из localStorage реально существуют
        // (если вдруг конфиг поменялся)
        const validCols = parsed.filter((id) =>
          columnsConfig.some((col) => col.id === id && !col.alwaysVisible)
        );

        // Устанавливаем
        setSelectedColumns(validCols);
      } else {
        // Если в localStorage ничего нет,
        // по умолчанию включаем все необязательные
        const def = columnsConfig
          .filter((col) => !col.alwaysVisible)
          .map((col) => col.id);
        setSelectedColumns(def);
      }
    }
  }, []);

  // Сохраняем в localStorage при каждом изменении selectedColumns
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Сохраняем только «не alwaysVisible» колонки
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedColumns));
    }
  }, [selectedColumns]);

  // -------------------------
  //  Ширина экрана (мобильный/ПК)
  // -------------------------
  const [windowWidth, setWindowWidth] = useState<number>(0);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  const isMobile = windowWidth > 0 && windowWidth < 640;

  // -------------------------
  //  Drawer (боковое меню на мобильном)
  // -------------------------
  const [drawerOpened, setDrawerOpened] = useState(false);
  const toggleDrawer = () => setDrawerOpened((o) => !o);

  // -------------------------
  //  Ограничения при «сжатии»
  // -------------------------
  useEffect(() => {
    if (isMobile) {
      enforceMobileLimit();
    } else {
      // При расширении - включаем все необязательные
      enableAllColumns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const enforceMobileLimit = () => {
    const alwaysVisibleCount = columnsConfig.filter((c) => c.alwaysVisible).length;
    if (alwaysVisibleCount >= MAX_MOBILE_COLUMNS) {
      // Никакие дополнительные не оставляем
      setSelectedColumns([]);
      return;
    }
    const maxExtra = MAX_MOBILE_COLUMNS - alwaysVisibleCount;
    const selectedNonAlways = columnsConfig.filter(
      (c) => !c.alwaysVisible && selectedColumns.includes(c.id)
    );
    if (selectedNonAlways.length > maxExtra) {
      const keep = selectedNonAlways.slice(0, maxExtra);
      setSelectedColumns(keep.map((c) => c.id));
    }
  };

  const enableAllColumns = () => {
    const allNonAlways = columnsConfig
      .filter((col) => !col.alwaysVisible)
      .map((col) => col.id);
    setSelectedColumns(allNonAlways);
  };

  // При клике в чекбоксе
  const handleToggleColumn = (colId: string) => {
    const isSelecting = !selectedColumns.includes(colId);

    if (isMobile && isSelecting) {
      const alwaysCount = columnsConfig.filter((c) => c.alwaysVisible).length;
      const currentTotal = alwaysCount + selectedColumns.length;
      if (currentTotal >= MAX_MOBILE_COLUMNS) {
        return; // не даём выбрать пятую
      }
    }

    setSelectedColumns((prev) =>
      prev.includes(colId)
        ? prev.filter((id) => id !== colId)
        : [...prev, colId]
    );
  };

  // -------------------------
  //  Формируем итоговый список колонок
  // -------------------------
  const visibleColumns = columnsConfig.filter(
    (col) => col.alwaysVisible || selectedColumns.includes(col.id)
  );

  // Генерация строк
  const rows = coins.map((coin, index) => (
    <Table.Tr
      key={coin.CoinInfo.Id}
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => router.push(`/coins/${coin.CoinInfo.Name}`)}
    >
      {visibleColumns.map((col) => {
        switch (col.id) {
          case 'star':
            return <Table.Td key="star">★</Table.Td>;
          case 'index':
            return <Table.Td key="index">{start + index}</Table.Td>;
          case 'name':
            return (
              <Table.Td key="name">
                <Link href={`/coins/${coin.CoinInfo.Name}`}>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={`https://www.cryptocompare.com/${coin.CoinInfo.ImageUrl}`}
                      alt=""
                      width={24}
                      height={24}
                    />
                    <span className="max-w-[150px] truncate">
                      {coin.CoinInfo.FullName}
                    </span>
                    <span>{coin.CoinInfo.Name}</span>
                  </div>
                </Link>
              </Table.Td>
            );
          case 'price':
            return (
              <Table.Td key="price">
                {coin.DISPLAY?.USD.PRICE ?? ''}
              </Table.Td>
            );
          case 'hour1Change':
            return (
              <Table.Td key="hour1Change">
                {coin.DISPLAY?.USD.CHANGEPCTHOUR ?? ''}
              </Table.Td>
            );
          case 'hour24Change':
            return (
              <Table.Td key="hour24Change">
                {coin.DISPLAY?.USD.CHANGEPCT24HOUR ?? ''}
              </Table.Td>
            );
          case 'marketCap':
            return (
              <Table.Td key="marketCap">
                {coin.DISPLAY?.USD.MKTCAP ?? ''}
              </Table.Td>
            );
          case 'volume24':
            return (
              <Table.Td key="volume24">
                {coin.DISPLAY?.USD.TOTALVOLUME24HTO ?? ''}
              </Table.Td>
            );
          case 'supply':
            return (
              <Table.Td key="supply">
                {coin.DISPLAY?.USD.SUPPLY ?? ''}
              </Table.Td>
            );
          case 'last7Days':
            return (
              <Table.Td key="last7Days">
                <Image
                  src={`https://images.cryptocompare.com/sparkchart/${coin.CoinInfo.Name}/USD/latest.png`}
                  alt=""
                  height={35}
                  width={150}
                />
              </Table.Td>
            );
          default:
            return null;
        }
      })}
    </Table.Tr>
  ));

  return (
    <>
      {/* Пагинация (сверху) */}
      <Pagination
        total={total}
        value={page}
        onChange={(p) => {
          router.push(p === 1 ? '/' : `/?page=${p}`);
        }}
        className="flex justify-center my-4"
      />

      <div className="overflow-x-auto relative">
        <Table stickyHeader stickyHeaderOffset={0}>
          <Table.Thead className="!top-0 bg-white z-10">
            <Table.Tr>
              {visibleColumns.map((col) => (
                <Table.Th key={col.id}>
                  <ColumnHeader
                    col={col}
                    isMobile={isMobile}
                    selectedColumns={selectedColumns}
                    handleToggleColumn={handleToggleColumn}
                    toggleDrawer={toggleDrawer}
                  />
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </div>

      {/* Пагинация (снизу) */}
      <Pagination
        total={total}
        value={page}
        onChange={(p) => {
          router.push(p === 1 ? '/' : `/?page=${p}`);
        }}
        className="flex justify-center my-4"
      />

      {/* Drawer (меню выбора колонок) для мобильного */}
      <Drawer
        opened={drawerOpened && isMobile}
        onClose={toggleDrawer}
        title="Выбор колонок"
        position="right"
        size="md"
        padding="md"
      >
        <div className="flex flex-col gap-2">
          <div className="mb-1 font-semibold text-sm">Выбор колонок</div>
          {columnsConfig
            .filter((c) => !c.alwaysVisible)
            .map((c) => {
              const isChecked = selectedColumns.includes(c.id);

              const alwaysCount = columnsConfig.filter((cc) => cc.alwaysVisible).length;
              const currentTotal = alwaysCount + selectedColumns.length;
              // Если уже выбрано 4 (учитывая alwaysVisible), 
              // а эта колонка ещё не выбрана => disabled
              const disabled = !isChecked && currentTotal >= MAX_MOBILE_COLUMNS;

              return (
                <Checkbox
                  key={c.id}
                  label={c.label || '—'}
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => handleToggleColumn(c.id)}
                />
              );
            })}
        </div>
      </Drawer>
    </>
  );
}