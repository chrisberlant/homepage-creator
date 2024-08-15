import CreateCategoryButton from '@/components/CreateCategoryButton';
import EditingModeButton from '@/components/EditingModeButton';
import Dashboard from '@/components/Dashboard';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import { getCategories } from '@/server-actions/categories';

export default async function Page() {
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ['categories'],
		queryFn: getCategories,
	});

	return (
		<section>
			<EditingModeButton />
			<CreateCategoryButton />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Dashboard />
			</HydrationBoundary>
			{/* <Test /> */}
		</section>
	);
}
