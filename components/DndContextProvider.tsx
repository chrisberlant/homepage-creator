'use client';
import {
	DndContext,
	MouseSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
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
		if (!event.active.id) return;

		const changedCategory = await changeLinkCategory({
			id: event.active.id,
			newCategoryId: event.over.id,
		});
		if (changedCategory?.error) toast.error(changedCategory.error);
	}

	return (
		<DndContext onDragEnd={handleDragEnd} sensors={sensors}>
			{children}
		</DndContext>
	);
}
