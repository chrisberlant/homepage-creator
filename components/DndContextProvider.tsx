'use client';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'sonner';
import { changeLinkCategory } from '../server-actions/links';
import { ReactNode } from 'react';

export default function DndContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	async function handleDragEnd(event: any) {
		const changedCategory = await changeLinkCategory({
			id: event.active.id,
			newCategoryId: event.over.id,
		});
		if (changedCategory?.error) toast.error('Cannot change category');
	}

	return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
