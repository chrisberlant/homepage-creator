'use client';

import { Moon, Sun } from 'lucide-react';
import { createContext, useEffect, useState, useContext } from 'react';

export function ThemeToggler() {
	const { theme, toggleTheme } = useContext(ThemeProviderContext);

	return (
		<button
			onClick={toggleTheme}
			className='hover:scale-110 right-8'
			aria-label='Toggle color theme'
		>
			{theme === 'light' ? <Sun /> : <Moon />}
		</button>
	);
}

type Theme = 'dark' | 'light';

type ThemeProviderState = {
	theme: Theme;
	toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
	theme: 'dark',
	toggleTheme: () => null,
};

export const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>('dark');
	const toggleTheme = () => {
		theme === 'dark' ? setTheme('light') : setTheme('dark');
	};

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(theme);
	}, [theme]);

	const value = {
		theme,
		toggleTheme,
	};

	return (
		<ThemeProviderContext.Provider value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}
