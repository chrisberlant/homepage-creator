'use client';

import { Sun, Moon } from 'lucide-react';
import { useContext } from 'react';
import { ThemeProviderContext } from './providers/ThemeProvider';

export default function ThemeToggler() {
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
