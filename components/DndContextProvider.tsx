'use client';
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { toast } from 'sonner';
import { changeLinkCategory } from '../server-actions/links';
import { ReactNode } from 'react';

export default function DndContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: 5 },
		})
	);

	async function handleDragEnd(event: any) {
		const { active, over } = event;
		const { index, categoryId } = active.data.current;

		// If category changed
		if (over?.id && categoryId !== over.id) {
			const changedCategory = await changeLinkCategory({
				id: active.id,
				index,
				categoryId,
				newCategoryId: over.id,
			});
			if (changedCategory?.error) toast.error(changedCategory.error);
		}
	}

	return (
		<DndContext
			id='dnd-context-id'
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			{children}
		</DndContext>
	);
}
