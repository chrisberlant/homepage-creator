'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export default function ThemeToggler() {
	const { setTheme, resolvedTheme } = useTheme();

	return (
		<Button
			variant='outline'
			size='icon'
			onClick={() =>
				setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
			}
		>
			<Sun className='size-[1.2rem] scale-100 transition-all dark:scale-0' />
			<Moon className='absolute size-[1.2rem] scale-0 transition-all dark:scale-100' />
		</Button>
	);
}
