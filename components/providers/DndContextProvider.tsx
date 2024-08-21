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
import { ReactNode, useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useChangeLinkCategory, useChangeLinkIndex } from '@/queries/links';

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
	const { mutate: changeLinkIndex } = useChangeLinkIndex();

	async function handleDragEnd(event: any) {
		const { active, over } = event;
		const { categoryId: currentCategoryId } = active.data.current;

		if (active.id === over.id || !over.id)
			return toast.info('Link did not move');

		console.log(event);

		// If dropped into another category with no index specified, put it at the end of it
		if (over.data.current?.isCategory) {
			return changeLinkCategory({
				id: active.id,
				newCategoryId: over.id,
			});
		}
		if (over.data.current?.index) {
			// new infos
			const { categoryId: newCategoryId, index: newIndex } =
				over.data.current;

			console.log(
				'new index',
				over.data.current.index,
				'new category',
				over.data.current.categoryId
			);
		}
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
