import EditingModeContextProvider from '@/components/providers/EditingModeContextProvider';
import { redirect } from 'next/navigation';
import { getSession } from '@/server-actions/auth.actions';
import CreateCategoryButton from '@/components/CreateCategoryButton';
import EditingModeButton from '@/components/EditingModeButton';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import fetchApiFromServer from '@/utils/fetchApiFromServer';

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
				<div className='flex justify-between mb-4'>
					<EditingModeButton />
					<CreateCategoryButton />
				</div>
				{children}
			</EditingModeContextProvider>
		</HydrationBoundary>
	);
}
