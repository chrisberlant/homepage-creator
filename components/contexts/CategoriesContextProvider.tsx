'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createContext } from 'react';
import { CategoryType } from '@/lib/types';

export const CategoriesContext = createContext<CategoryType[]>([]);

export default function CategoriesContextProvider({
	items,
	children,
}: {
	items: CategoryType[];
	children: ReactNode;
}) {
	return (
		<CategoriesContext.Provider value={items}>
			{children}
		</CategoriesContext.Provider>
	);
}
