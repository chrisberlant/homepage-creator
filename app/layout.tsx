import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, ThemeToggler } from '../components/ThemeToggler';

export const metadata: Metadata = {
	title: 'My Homepage',
	description: 'Homepage creator',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ThemeProvider>
			<html lang='en'>
				<body>
					<header className='flex justify-center items-center'>
						<h1 className='text-4xl font-bold text-center'>
							My Homepage
						</h1>
						<ThemeToggler />
					</header>
					<main>{children}</main>
				</body>
			</html>
		</ThemeProvider>
	);
}
