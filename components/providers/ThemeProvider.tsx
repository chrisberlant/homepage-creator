'use client';

import { createContext, useEffect, useState, useContext } from 'react';

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
	const [theme, setTheme] = useState<Theme>(
		(localStorage.getItem('homepage-theme') as 'dark' | 'light') || 'dark'
	);

	const toggleTheme = () => {
		theme === 'dark'
			? (localStorage.setItem('homepage-theme', 'light'),
			  setTheme('light'))
			: (localStorage.setItem('homepage-theme', 'dark'),
			  setTheme('dark'));
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
