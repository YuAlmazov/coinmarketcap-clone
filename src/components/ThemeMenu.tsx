'use client';

import { ActionIcon, Menu, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import localforage from 'localforage';

// Ключ для хранения в IndexedDB
const THEME_KEY = 'theme_preferred_mode';

const ThemeMenu = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  // -------------------------
  // Считываем тему один раз при монтировании
  // -------------------------
  useEffect(() => {
    let isActive = true;
    localforage.getItem<string>(THEME_KEY).then((storedTheme) => {
      if (isActive && storedTheme && storedTheme !== colorScheme) {
        setColorScheme(storedTheme);
      }
      setMounted(true);
    });
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Меняем тему и записываем в IndexedDB
  // -------------------------
  const handleChangeTheme = useCallback(
    (theme: 'light' | 'dark') => {
      setColorScheme(theme);
      localforage.setItem(THEME_KEY, theme);
    },
    [setColorScheme]
  );

  // Пока не смонтировались (ещё не знаем про StoredTheme) — не рендерим
  if (!mounted) {
    return <div className="w-[34px] h-[34px]" />;
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="outline" size="lg">
          {colorScheme === 'dark' ? <IconMoon size={16} /> : <IconSun size={16} />}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Theme</Menu.Label>
        <Menu.Item
          onClick={() => handleChangeTheme('light')}
          leftSection={<IconSun size={16} />}
        >
          Light
        </Menu.Item>
        <Menu.Item
          onClick={() => handleChangeTheme('dark')}
          leftSection={<IconMoon size={16} />}
        >
          Dark
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ThemeMenu;
