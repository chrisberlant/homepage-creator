import EditingModeContextProvider from '@/components/providers/EditingModeContextProvider';
import { redirect } from 'next/navigation';
import { getSession } from '@/server-actions/auth';
import CreateCategoryButton from '../../components/CreateCategoryButton';
import EditingModeButton from '../../components/EditingModeButton';

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();
	if (!session) redirect('/');

	return (
		<EditingModeContextProvider>
			<div className='flex justify-between mb-4'>
				<EditingModeButton />
				<CreateCategoryButton />
			</div>
			{children}
		</EditingModeContextProvider>
	);
}
