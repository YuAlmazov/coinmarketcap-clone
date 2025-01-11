import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import Navbar from '@/components/Navbar';



import { getLatestNews } from '../../services/news';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'CoinMarketCrap',
	description: 'CoinMarketCrap',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const news = await getLatestNews();
	
	return (
		<html lang="en">
			<head>
				<ColorSchemeScript />
				
			</head>
			<body className={inter.className}>
				<MantineProvider>
					<Navbar />
					{children}
				</MantineProvider>
			</body>
		</html>
	);
}
