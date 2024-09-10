'use client';

import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { createContext } from 'react';

type DisabledDraggingContextType = {
	disabledDragging: boolean;
	setDisabledDragging: Dispatch<SetStateAction<boolean>>;
};

export const DisabledDraggingContext =
	createContext<DisabledDraggingContextType>({
		disabledDragging: false,
		setDisabledDragging: () => null,
	});

export default function EditingModeContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [disabledDragging, setDisabledDragging] = useState(false);

	const value = { disabledDragging, setDisabledDragging };

	// Disable dragging when editing a link or category
	return (
		<DisabledDraggingContext.Provider value={value}>
			{children}
		</DisabledDraggingContext.Provider>
	);
}
