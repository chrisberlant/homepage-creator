import Dashboard from '@/components/Dashboard';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import fetchApiFromServer from '@/utils/fetchApiFromServer';

export default async function Page() {
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ['categories'],
		queryFn: async () => await fetchApiFromServer('/categories'),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Dashboard />
		</HydrationBoundary>
	);
}
