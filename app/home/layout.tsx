'use client';
import EditingModeContextProvider from '@/components/EditingModeContextProvider';

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <EditingModeContextProvider>{children}</EditingModeContextProvider>;
}
