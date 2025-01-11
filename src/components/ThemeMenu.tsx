'use client';

import { ActionIcon, Menu, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import localforage from 'localforage';

const THEME_KEY = 'theme_preferred_mode';

const ThemeMenu = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // При первом рендере пытаемся прочитать тему из IndexedDB
  useEffect(() => {
    let isMounted = true;
    localforage.getItem<string>(THEME_KEY).then((storedTheme) => {
      if (isMounted && storedTheme) {
        setColorScheme(storedTheme);
      }
      setMounted(true);
    });

    return () => {
      isMounted = false;
    };
  }, [setColorScheme]);

  // При смене темы записываем в IndexedDB
  useEffect(() => {
    if (mounted) {
      localforage.setItem(THEME_KEY, colorScheme);
    }
  }, [colorScheme, mounted]);

  // Пока не прочитали из IndexedDB, возвращаем пустой блок, чтобы не мигала тема
  if (!mounted) {
    return <div className="w-[34px] h-[34px]" />;
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant="outline" size="lg">
          {colorScheme === 'dark' ? (
            <IconMoon size={16} />
          ) : (
            <IconSun size={16} />
          )}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Theme</Menu.Label>
        <Menu.Item
          onClick={() => setColorScheme('light')}
          leftSection={<IconSun size={16} />}
        >
          Light
        </Menu.Item>
        <Menu.Item
          onClick={() => setColorScheme('dark')}
          leftSection={<IconMoon size={16} />}
        >
          Dark
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ThemeMenu;
