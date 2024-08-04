import type { Metadata } from 'next';
import { ThemeProvider, ThemeToggler } from '@/components/ThemeToggler';
import { Toaster } from 'sonner';
import { getSession } from '@/server-actions/auth';
import LogoutButton from '../components/LogoutButton';
import './globals.css';

export const metadata: Metadata = {
	title: 'My Homepage',
	description: 'Homepage creator',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();

	return (
		<ThemeProvider>
			<html lang='en'>
				<body>
					<header className='flex  items-center'>
						<h1 className='text-4xl font-bold text-center ml-auto'>
							My Homepage
						</h1>
						<div className='flex ml-auto'>
							{session && (
								<LogoutButton name={session.user.name} />
							)}
							<ThemeToggler />
						</div>
					</header>

					<main>
						<Toaster />
						{children}
					</main>
				</body>
			</html>
		</ThemeProvider>
	);
}
