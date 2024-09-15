import EditingModeContextProvider from '@/components/providers/EditingModeContextProvider';
import { redirect } from 'next/navigation';
import EditingModeButton from '@/components/EditingModeButton';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import fetchApiFromServer from '@/utils/fetchApiFromServer';
import { getSession } from '@/lib/jwt';

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();
	if (!session) redirect('/');

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ['categories'],
		queryFn: async () => await fetchApiFromServer('/categories'),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<EditingModeContextProvider>
				<EditingModeButton />
				{children}
			</EditingModeContextProvider>
		</HydrationBoundary>
	);
}
