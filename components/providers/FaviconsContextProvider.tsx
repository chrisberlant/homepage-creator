'use client';

import { createContext, ReactNode } from 'react';

type FaviconType = {
	id: number;
	url: string;
};

export const FaviconsContext = createContext<FaviconType[]>([]);

export default function FaviconsContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const favicons = localStorage.getItem('favicons');
	const parsedFavicons = favicons ? JSON.parse(favicons) : [];

	// Drag'n'drop is activated only when in editing mode
	return (
		<FaviconsContext.Provider value={parsedFavicons}>
			{children}
		</FaviconsContext.Provider>
	);
}
