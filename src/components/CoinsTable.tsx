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

// Ключ в localStorage для хранения выбранных пользователем колонок
const STORAGE_KEY = 'userSelectedColumns';

interface Column {
  id: string;
  label: string;
  alwaysVisible: boolean;
}

function ColumnHeader({
  col,
  isMobile,
  selectedColumns,
  handleToggleColumn,
  toggleDrawer,
}: {
  col: Column;
  isMobile: boolean;
  selectedColumns: string[];
  handleToggleColumn: (id: string) => void;
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
  // Текущие монеты (серверная пагинация)
  coins,
  // Все монеты (для глобального поиска)
  allCoins,
  // Число страниц (при отсутствии поиска)
  total,
}: {
  coins: CoinsData[];
  allCoins?: CoinsData[];
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const page = pageParam ? +pageParam : 1;

  // -------------------------
  //  Поиск
  // -------------------------
  const [rawSearchValue, setRawSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCoins, setFilteredCoins] = useState<CoinsData[]>(coins);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      // Если нет поискового запроса
      setFilteredCoins(coins);
      return;
    }

    // Если есть запрос -> ищем по allCoins (или fallback = coins)
    const source = Array.isArray(allCoins) && allCoins.length > 0 ? allCoins : coins;
    const result = source.filter(
      (coin) =>
        coin.CoinInfo.FullName.toLowerCase().includes(q) ||
        coin.CoinInfo.Name.toLowerCase().includes(q)
    );

    // Удаляем дубли (если одна и та же монета встречается несколько раз)
    // Считаем уникальность по CoinInfo.Id
    const uniqueResult = Array.from(
      new Map(result.map((item) => [item.CoinInfo.Id, item])).values()
    );

    setFilteredCoins(uniqueResult);
  }, [searchQuery, coins, allCoins]);

  const handleSearch = () => {
    router.push('/'); // Возвращаемся на первую страницу
    setSearchQuery(rawSearchValue.trim());
  };

  // -------------------------
  //  Пагинация
  // -------------------------
  let coinsToRender = filteredCoins;
  let displayedTotal = total;

  // При поиске «клиентская» пагинация
  if (searchQuery) {
    displayedTotal = Math.ceil(filteredCoins.length / 100);
    const startIndex = (page - 1) * 100;
    const endIndex = startIndex + 100;
    coinsToRender = filteredCoins.slice(startIndex, endIndex);
  }

  // -------------------------
  //  Управление выбранными колонками
  // -------------------------
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Загрузка из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromStorage = localStorage.getItem(STORAGE_KEY);
      if (fromStorage) {
        const parsed = JSON.parse(fromStorage) as string[];
        // Валидируем, чтобы не было «битых» колонок
        const validCols = parsed.filter((id) =>
          columnsConfig.some((col) => col.id === id && !col.alwaysVisible)
        );
        setSelectedColumns(validCols);
      } else {
        // Если в localStorage пусто – включаем все «не alwaysVisible»
        const def = columnsConfig
          .filter((col) => !col.alwaysVisible)
          .map((col) => col.id);
        setSelectedColumns(def);
      }
    }
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedColumns));
    }
  }, [selectedColumns]);

  // -------------------------
  //  Определение «мобильности»
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
  //  Drawer (мобильные настройки)
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
      enableAllColumns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const enforceMobileLimit = () => {
    const alwaysVisibleCount = columnsConfig.filter((c) => c.alwaysVisible).length;
    if (alwaysVisibleCount >= MAX_MOBILE_COLUMNS) {
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

  const handleToggleColumn = (colId: string) => {
    const isSelecting = !selectedColumns.includes(colId);
    if (isMobile && isSelecting) {
      const alwaysCount = columnsConfig.filter((c) => c.alwaysVisible).length;
      const currentTotal = alwaysCount + selectedColumns.length;
      if (currentTotal >= MAX_MOBILE_COLUMNS) {
        return; // Не даём выбрать «лишнюю» колонку
      }
    }
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  // -------------------------
  //  Список «видимых» колонок
  // -------------------------
  const visibleColumns = columnsConfig.filter(
    (col) => col.alwaysVisible || selectedColumns.includes(col.id)
  );

  // Генерация строк таблицы
  const rows = coinsToRender.map((coin, index) => (
    <Table.Tr
      key={coin.CoinInfo.Id}
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => router.push(`/coins/${coin.CoinInfo.Name}`)}
    >
      {visibleColumns.map((col) => {
        switch (col.id) {
          case 'index':
            return (
              <Table.Td key="index">
                {(page - 1) * 100 + (index + 1)}
              </Table.Td>
            );
          case 'name':
            return (
              <Table.Td key="name">
                <Link href={`/coins/${coin.CoinInfo.Name}`}>
                  <div className="flex items-center space-x-2">
                    <Image
                      src={`https://www.cryptocompare.com/${coin.CoinInfo.ImageUrl}`}
                      alt={coin.CoinInfo.Name}
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
      {/* Поле ввода и кнопка "Search" */}
      <div className="flex items-center justify-center gap-2 my-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={rawSearchValue}
          onChange={(e) => setRawSearchValue(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Search
        </button>
      </div>

      {/* Пагинация (сверху) */}
      <Pagination
        total={displayedTotal}
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
        total={displayedTotal}
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
