'use client';

import { ReactNode, useState } from 'react';
import { createContext } from 'react';
import LinksDndContextProvider from './DndContextProvider';
import DndContextProvider from './DndContextProvider';

type EditingModeContextType = {
	editingMode: boolean;
	toggleEditingMode: () => void;
};

export const EditingModeContext = createContext<EditingModeContextType>({
	editingMode: false,
	toggleEditingMode: () => null,
});

export default function EditingModeContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [editingMode, setEditingMode] = useState(true);
	const toggleEditingMode = () => setEditingMode(!editingMode);

	const value = { editingMode, toggleEditingMode };

	// Drag'n'drop is activated only when in editing mode
	return (
		<EditingModeContext.Provider value={value}>
			{editingMode ? (
				<DndContextProvider>{children}</DndContextProvider>
			) : (
				<>{children}</>
			)}
		</EditingModeContext.Provider>
	);
}
