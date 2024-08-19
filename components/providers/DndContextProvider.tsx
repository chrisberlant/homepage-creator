'use client';

import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { changeLinkCategory } from '@/server-actions/links';
import { ReactNode, useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useChangeLinkCategory } from '../../queries/links';

export default function DndContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [items] = useState([1, 2, 3]);
	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: 5 },
		}),
		// useSensor(PointerSensor)
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const { mutate: changeLinkCategory } = useChangeLinkCategory();

	async function handleDragEnd(event: any) {
		const { active, over } = event;
		const { index, categoryId } = active.data.current;

		if (active.id === over.id || !over.id)
			return toast.info('Link did not move');

		console.log(event);

		// If dropped into another category
		if (over.data.current?.isCategory) {
			return changeLinkCategory({
				id: active.id,
				index,
				oldCategoryId: categoryId,
				newCategoryId: over.id,
			});
		}

		// TODO index handling when dropped on another link
		console.log('new index', over.data.current.index);
	}

	async function handleDragOver(event: any) {
		// console.log(event);
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
