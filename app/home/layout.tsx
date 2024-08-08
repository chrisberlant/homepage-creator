'use client';
import { DndContext } from '@dnd-kit/core';
import { changeLinkCategory } from '@/server-actions/links';
import { toast } from 'sonner';
import { createContext, useState } from 'react';

type EditingContextType = {
	editingMode: boolean;
	toggleEditingMode: () => void;
};

export const EditingContext = createContext<EditingContextType>({
	editingMode: false,
	toggleEditingMode: () => null,
});

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [editingMode, setEditingMode] = useState(false);
	const toggleEditingMode = () => {
		setEditingMode((prev) => !prev);
	};

	async function handleDragEnd(event: any) {
		const changedCategory = await changeLinkCategory({
			id: event.active.id,
			newCategoryId: event.over.id,
		});
		if (changedCategory?.error) toast.error('Cannot change category');
	}

	const value = { editingMode, toggleEditingMode };

	return editingMode ? (
		<EditingContext.Provider value={value}>
			<DndContext onDragEnd={handleDragEnd}>{children}</DndContext>
		</EditingContext.Provider>
	) : (
		<EditingContext.Provider value={value}>
			{children}
		</EditingContext.Provider>
	);
}
