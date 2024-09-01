import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query';
import { getAuth, getSession } from '../server-actions/auth';
import LogoutButton from './LogoutButton';
import { ThemeToggler } from './ThemeToggler';

export default async function Header() {
	const session = await getSession();
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ['user'],
		queryFn: async () => await getAuth(),
	});

	return (
		<header className='flex items-center p-5'>
			<h1 className='text-4xl font-bold ml-auto'>My Homepage</h1>
			<div className='flex ml-auto'>
				{session && (
					<HydrationBoundary state={dehydrate(queryClient)}>
						<LogoutButton />
					</HydrationBoundary>
				)}
				<ThemeToggler />
			</div>
		</header>
	);
}
