'use client';

import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { CoinsData } from '@/types/coin';
import {
  Pagination,
  Table,
  Checkbox,
  Popover,
  Drawer,
} from '@mantine/core';
import { IconSettings, IconStar, IconStarFilled } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const columnsConfig = [
  { id: 'favorite', label: '', alwaysVisible: true },
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

const STORAGE_KEY_COLUMNS = 'userSelectedColumns';
const STORAGE_KEY_FAVORITES = 'favoriteCoins';

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
    e.stopPropagation();
    if (isMobile) {
      toggleDrawer();
    } else {
      setOpened((prev) => !prev);
    }
  };

  if (col.id === 'favorite') {
    return (
      <div className="flex items-center justify-center w-full font-bold text-sm uppercase" />
    );
  }

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
            className="ml-1 text-gray-400 hover:text-gray-700"
            onClick={handleGearClick}
          >
            <IconSettings size={16} />
          </button>
        </div>
      </Popover.Target>

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
  coins,      // Текущие монеты (серверная пагинация)
  allCoins,   // Все монеты (по всем страницам)
  total,      // Число страниц (при серверной пагинации)
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
  // States: поиск / избранное
  // -------------------------
  const [rawSearchValue, setRawSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // -------------------------
  // IndexedDB: favorites
  // -------------------------
  useEffect(() => {
    localforage.getItem<string[]>(STORAGE_KEY_FAVORITES).then((stored) => {
      if (stored && Array.isArray(stored)) {
        setFavorites(stored);
      }
    });
  }, []);

  useEffect(() => {
    localforage.setItem(STORAGE_KEY_FAVORITES, favorites);
  }, [favorites]);

  const toggleFavorite = (coinId: string) => {
    setFavorites((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );
  };

  // -------------------------
  // Search handler
  // -------------------------
  const handleSearch = () => {
    // Важно: добавляем { scroll: false }!
    router.push('/', { scroll: false });
    setSearchQuery(rawSearchValue.trim());
  };

  // -------------------------
  // Логика фильтрации монет
  // -------------------------
  let baseCoins: CoinsData[] = coins;
  const q = searchQuery.toLowerCase();

  if ((showOnlyFavorites || q) && Array.isArray(allCoins) && allCoins.length > 0) {
    baseCoins = allCoins;
  }

  if (showOnlyFavorites) {
    baseCoins = baseCoins.filter((c) => favorites.includes(c.CoinInfo.Id));
  }

  if (q) {
    baseCoins = baseCoins.filter(
      (coin) =>
        coin.CoinInfo.FullName.toLowerCase().includes(q) ||
        coin.CoinInfo.Name.toLowerCase().includes(q)
    );
  }

  // Убираем возможные дубли (по CoinInfo.Id)
  baseCoins = Array.from(
    new Map(baseCoins.map((item) => [item.CoinInfo.Id, item])).values()
  );

  // -------------------------
  // Пагинация
  // -------------------------
  const needClientSidePagination = showOnlyFavorites || q;
  let coinsToRender = baseCoins;
  let displayedTotal = total;

  if (needClientSidePagination) {
    displayedTotal = Math.ceil(baseCoins.length / 100);
    const startIndex = (page - 1) * 100;
    const endIndex = startIndex + 100;
    coinsToRender = baseCoins.slice(startIndex, endIndex);
  }

  // -------------------------
  // Выбранные колонки
  // -------------------------
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fromStorage = localStorage.getItem(STORAGE_KEY_COLUMNS);
      if (fromStorage) {
        const parsed = JSON.parse(fromStorage) as string[];
        const validCols = parsed.filter((id) =>
          columnsConfig.some((col) => col.id === id && !col.alwaysVisible)
        );
        setSelectedColumns(validCols);
      } else {
        const def = columnsConfig
          .filter((col) => !col.alwaysVisible)
          .map((col) => col.id);
        setSelectedColumns(def);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(selectedColumns));
    }
  }, [selectedColumns]);

  // -------------------------
  // Мобильный режим / Drawer
  // -------------------------
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const isMobile = windowWidth > 0 && windowWidth < 640;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const [drawerOpened, setDrawerOpened] = useState(false);
  const toggleDrawer = () => setDrawerOpened((o) => !o);

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
        return;
      }
    }
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  // -------------------------
  // Рендер таблицы
  // -------------------------
  const visibleColumns = columnsConfig.filter(
    (col) => col.alwaysVisible || selectedColumns.includes(col.id)
  );

  const rows = coinsToRender.map((coin, index) => {
    const isServerSide = !needClientSidePagination;
    const rowIndex = isServerSide
      ? (page - 1) * 100 + (index + 1)
      : index + 1;

    return (
      <Table.Tr
        key={coin.CoinInfo.Id}
        className="hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => {
          // Переход на страницу монеты без скролла
          router.push(`/coins/${coin.CoinInfo.Name}`, { scroll: false });
        }}
      >
        {visibleColumns.map((col) => {
          switch (col.id) {
            case 'favorite':
              return (
                <Table.Td
                  key="favorite"
                  onClick={(e) => e.stopPropagation()}
                  className="text-center"
                >
                  <button
                    onClick={() => toggleFavorite(coin.CoinInfo.Id)}
                    className="text-yellow-500 hover:scale-110 transition-transform"
                  >
                    {favorites.includes(coin.CoinInfo.Id) ? (
                      <IconStarFilled size={20} />
                    ) : (
                      <IconStar size={20} />
                    )}
                  </button>
                </Table.Td>
              );
            case 'index':
              return (
                <Table.Td key="index" className="px-2 py-2 text-sm">
                  {rowIndex}
                </Table.Td>
              );
            case 'name':
              return (
                <Table.Td key="name" className="px-2 py-2">
                  <Link href={`/coins/${coin.CoinInfo.Name}`} scroll={false}>
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
                      <span className="text-gray-500 font-medium">
                        {coin.CoinInfo.Name}
                      </span>
                    </div>
                  </Link>
                </Table.Td>
              );
            case 'price':
              return (
                <Table.Td key="price" className="px-2 py-2 text-right">
                  {coin.DISPLAY?.USD.PRICE ?? ''}
                </Table.Td>
              );
            case 'hour1Change':
              return (
                <Table.Td key="hour1Change" className="px-2 py-2 text-right">
                  {coin.DISPLAY?.USD.CHANGEPCTHOUR ?? ''}
                </Table.Td>
              );
            case 'hour24Change':
              return (
                <Table.Td key="hour24Change" className="px-2 py-2 text-right">
                  {coin.DISPLAY?.USD.CHANGEPCT24HOUR ?? ''}
                </Table.Td>
              );
            case 'marketCap':
              return (
                <Table.Td key="marketCap" className="px-2 py-2 text-right">
                  {coin.DISPLAY?.USD.MKTCAP ?? ''}
                </Table.Td>
              );
            case 'volume24':
              return (
                <Table.Td key="volume24" className="px-2 py-2 text-right">
                  {coin.DISPLAY?.USD.TOTALVOLUME24HTO ?? ''}
                </Table.Td>
              );
            case 'supply':
              return (
                <Table.Td key="supply" className="px-2 py-2 text-right">
                  {coin.DISPLAY?.USD.SUPPLY ?? ''}
                </Table.Td>
              );
            case 'last7Days':
              return (
                <Table.Td key="last7Days" className="px-2 py-2">
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
    );
  });

  return (
    <>
      {/* Поиск и кнопки */}
      <div className="flex items-center justify-center flex-wrap gap-3 my-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={rawSearchValue}
          onChange={(e) => setRawSearchValue(e.target.value)}
          className="w-[200px] md:w-[300px] rounded-lg border border-gray-300 px-3 py-2 
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     shadow-sm transition-colors"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-blue-400 shadow-md transition-colors"
        >
          Search
        </button>

        <button
          onClick={() => {
            // Переключаем фавориты без скролла
            router.push('/', { scroll: false });
            setShowOnlyFavorites((prev) => !prev);
          }}
          className={`
            px-4 py-2 rounded-lg shadow-md transition-colors 
            focus:outline-none focus:ring-2 focus:ring-blue-400
            ${
              showOnlyFavorites
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }
          `}
        >
          My Favorite
        </button>
      </div>

      {/* Пагинация (сверху) */}
      <Pagination
        total={displayedTotal}
        value={page}
        onChange={(p) => {
          // При смене страницы не прокручиваем вверх
          router.push(p === 1 ? '/' : `/?page=${p}`, { scroll: false });
        }}
        className="flex justify-center my-4"
      />

      <div className="overflow-x-auto relative border rounded-lg shadow-sm">
        <Table striped highlightOnHover withBorder withColumnBorders>
          <Table.Thead>
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
          router.push(p === 1 ? '/' : `/?page=${p}`, { scroll: false });
        }}
        className="flex justify-center my-4"
      />

      {/* Drawer (мобильный) */}
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
