'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';

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
	const [favicons, setFavicons] = useState<FaviconType[]>([]);

	useEffect(() => {
		const storedFavicons = localStorage.getItem('favicons');
		if (storedFavicons) setFavicons(JSON.parse(storedFavicons));
	}, []);

	// Drag'n'drop is activated only when in editing mode
	return (
		<FaviconsContext.Provider value={favicons}>
			{children}
		</FaviconsContext.Provider>
	);
}
