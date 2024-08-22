import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeToggler';
import { Toaster } from 'sonner';
import Header from '@/components/Header';
import QueryProvider from '@/components/providers/QueryClientProvider';
import './globals.css';

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
				<body className='bg-background text-foreground'>
					<Header />
					<main className='p-5'>
						<Toaster richColors closeButton />
						<QueryProvider>{children}</QueryProvider>
					</main>
				</body>
			</html>
		</ThemeProvider>
	);
}
