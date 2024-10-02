'use client';

import { createContext, useEffect, useState } from 'react';

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

	useEffect(() => {
		const storedTheme = localStorage.getItem('homepage-theme') as Theme;
		if (storedTheme) setTheme(storedTheme);
	}, []);

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(theme);
	}, [theme]);

	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark';

		localStorage.setItem('homepage-theme', newTheme);
		setTheme(newTheme);
	};

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
