'use client';

import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import {
  Pagination,
  Table,
  Checkbox,
  Popover,
  Drawer,
} from '@mantine/core';
import { IconSettings, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface ExchangeData {
  Id: string;
  Name: string;
  ImageUrl?: string;
  Country?: string;
  Grade?: string;
  GradePoints?: number;
  AffiliateURL?: string;
}

const columnsConfig = [
  { id: 'favorite', label: '', alwaysVisible: true },
  { id: 'index', label: '#', alwaysVisible: false },
  { id: 'name', label: 'Name', alwaysVisible: true },
  { id: 'country', label: 'Country', alwaysVisible: false },
  { id: 'grade', label: 'Grade', alwaysVisible: false },
  { id: 'gradePoints', label: 'Points', alwaysVisible: false },
  { id: 'affiliateUrl', label: 'Affiliate Link', alwaysVisible: false },
];

const MAX_MOBILE_COLUMNS = 3;
const STORAGE_KEY_COLUMNS = 'userSelectedExchangeColumns';
const STORAGE_KEY_FAVORITES = 'favoriteExchanges';

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

export default function ExchangesTable({
  exchanges,
  allExchanges,
  total,
}: {
  exchanges: ExchangeData[];
  allExchanges?: ExchangeData[];
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

  const toggleFavorite = (exchangeId: string) => {
    setFavorites((prev) =>
      prev.includes(exchangeId)
        ? prev.filter((x) => x !== exchangeId)
        : [...prev, exchangeId]
    );
  };

  // -------------------------
  // Search handler
  // -------------------------
  const handleSearch = () => {
    router.push('/exchanges', { scroll: false });
    setSearchQuery(rawSearchValue.trim());
  };

  // -------------------------
  // Логика фильтрации
  // -------------------------
  let baseExchanges: ExchangeData[] = exchanges; // Серверная страница
  const q = searchQuery.toLowerCase();

  if ((showOnlyFavorites || q) && Array.isArray(allExchanges)) {
    // При включённом избранном / поиске — используем весь массив
    baseExchanges = allExchanges;
  }

  if (showOnlyFavorites) {
    baseExchanges = baseExchanges.filter((ex) => favorites.includes(ex.Id));
  }

  if (q) {
    baseExchanges = baseExchanges.filter((ex) =>
      ex.Name.toLowerCase().includes(q)
    );
  }

  // Убираем дубли (если вдруг есть)
  baseExchanges = Array.from(
    new Map(baseExchanges.map((item) => [item.Id, item])).values()
  );

  // -------------------------
  // Пагинация
  // -------------------------
  // Поведение «как в CoinsTable»: если избранное / поиск включены, 
  // мы переходим на клиентскую пагинацию. Иначе — серверная.
  const needClientSidePagination = showOnlyFavorites || q;

  let exchangesToRender = baseExchanges;
  let displayedTotal = total;

  if (needClientSidePagination) {
    // Вместо 50 используем 100, чтобы соответствовать «стандартному» количеству
    displayedTotal = Math.ceil(baseExchanges.length / 100);

    const startIndex = (page - 1) * 100;
    const endIndex = startIndex + 100;
    exchangesToRender = baseExchanges.slice(startIndex, endIndex);
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

  const rows = exchangesToRender.map((ex, index) => {
    // Для корректного счёта используем (page - 1) * 100 + (index + 1)
    // даже при включённом поиске (client-side pagination).
    const rowIndex = (page - 1) * 100 + (index + 1);

    return (
      <Table.Tr
        key={ex.Id}
        className="hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={() => {
          // переход на страницу биржи, если нужно
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
                    onClick={() => toggleFavorite(ex.Id)}
                    className="text-yellow-500 hover:scale-110 transition-transform"
                  >
                    {favorites.includes(ex.Id) ? (
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
                  {ex.Name}
                </Table.Td>
              );
            case 'country':
              return (
                <Table.Td key="country" className="px-2 py-2">
                  {ex.Country || '—'}
                </Table.Td>
              );
            case 'grade':
              return (
                <Table.Td key="grade" className="px-2 py-2 text-center">
                  {ex.Grade || '—'}
                </Table.Td>
              );
            case 'gradePoints':
              return (
                <Table.Td key="gradePoints" className="px-2 py-2 text-right">
                  {ex.GradePoints || 0}
                </Table.Td>
              );
            case 'affiliateUrl':
              return (
                <Table.Td key="affiliateUrl" className="px-2 py-2">
                  {ex.AffiliateURL ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(ex.AffiliateURL, '_blank', 'noopener,noreferrer');
                      }}
                      className="
                        bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                        px-3 py-2 rounded-md shadow-md 
                        hover:brightness-110 
                        transition-transform hover:scale-105 
                        focus:outline-none focus:ring-2 focus:ring-purple-400
                      "
                    >
                      Visit Exchange
                    </button>
                  ) : (
                    '—'
                  )}
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
          placeholder="Search by exchange name..."
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
            router.push('/exchanges', { scroll: false });
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
          // При смене страницы — без скролла
          router.push(p === 1 ? '/exchanges' : `/exchanges?page=${p}`, {
            scroll: false,
          });
        }}
        className="flex justify-center my-4"
      />

      <div className="overflow-x-auto relative border rounded-lg shadow-sm">
        <Table striped highlightOnHover>
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
          router.push(p === 1 ? '/exchanges' : `/exchanges?page=${p}`, {
            scroll: false,
          });
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
