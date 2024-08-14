import EditingModeContextProvider from '@/components/contexts/EditingModeContextProvider';
import { redirect } from 'next/navigation';
import { getSession } from '@/server-actions/auth';
import fetchApi from '@/lib/fetchApi';
import CategoriesContextProvider from '../../components/contexts/CategoriesContextProvider';

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();
	if (!session) redirect('/');

	const categories = await fetchApi('/categories');

	return (
		<CategoriesContextProvider items={categories}>
			<EditingModeContextProvider>{children}</EditingModeContextProvider>
		</CategoriesContextProvider>
	);
}
