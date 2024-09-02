'use client';

import { useGetUser, useLogout } from '@/queries/auth';
import { Button } from './ui/button';
import { Sun, Moon } from 'lucide-react';
import { useContext } from 'react';
import { ThemeProviderContext } from './ThemeToggler';

function ThemeToggler() {
	const { theme, toggleTheme } = useContext(ThemeProviderContext);

	return (
		<button
			onClick={toggleTheme}
			className='hover:scale-110'
			aria-label='Toggle color theme'
		>
			{theme === 'light' ? <Sun /> : <Moon />}
		</button>
	);
}

export default function LogoutButton() {
	const { data: user } = useGetUser();
	const { mutate: logout } = useLogout();

	return (
		<div className='absolute flex items-center right-8'>
			<span className='mr-4'>{user?.username}</span>
			<Button
				variant='destructive'
				onClick={() => logout()}
				className='mr-6'
			>
				Logout
			</Button>
			<ThemeToggler />
		</div>
	);
}
