import EditingModeContextProvider from '@/components/providers/EditingModeContextProvider';
import { redirect } from 'next/navigation';
import { getSession } from '@/server-actions/auth';

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();
	if (!session) redirect('/');

	return <EditingModeContextProvider>{children}</EditingModeContextProvider>;
}
