import { getSession } from '../server-actions/auth';
import LogoutButton from './LogoutButton';
import { ThemeToggler } from './ThemeToggler';

export default async function Header() {
	const session = await getSession();

	return (
		<header className='flex items-center p-5'>
			<h1 className='text-4xl font-bold ml-auto'>My Homepage</h1>
			<div className='flex ml-auto'>
				{session && <LogoutButton name={session.user.name} />}
				<ThemeToggler />
			</div>
		</header>
	);
}
