import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import LogoutButton from './LogoutButton';
import AccountDetails from './AccountDetails';
import ThemeToggler from './ThemeToggler';
import { getAuth } from '@/server-actions/auth.actions';
import { getSession } from '@/lib/jwt';

export default async function Header() {
	const session = await getSession();
	let dehydratedState = null;
	if (session) {
		const queryClient = new QueryClient();
		await queryClient.prefetchQuery({
			queryKey: ['user'],
			queryFn: async () => await getAuth(),
		});
		dehydratedState = dehydrate(queryClient);
	}

	return (
		<header className='flex items-center justify-center p-5'>
			<h1 className='text-center text-4xl font-bold'>My Homepage</h1>
			{session && (
				<div className='absolute right-8 flex items-center'>
					<HydrationBoundary state={dehydratedState}>
						<AccountDetails />
					</HydrationBoundary>
					<LogoutButton />
					<ThemeToggler />
				</div>
			)}
		</header>
	);
}
