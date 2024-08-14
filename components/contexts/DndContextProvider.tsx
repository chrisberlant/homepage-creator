'use client';

import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { changeLinkCategory } from '../../server-actions/links';
import { ReactNode, useContext } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export default function DndContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
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

	async function handleDragOver(event: any) {
		console.log(event);
	}

	return (
		<DndContext
			id='dnd-context-id'
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			collisionDetection={closestCenter}
			sensors={sensors}
		>
			{children}
		</DndContext>
	);
}
