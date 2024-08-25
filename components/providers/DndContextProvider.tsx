'use client';

import {
	DndContext,
	KeyboardSensor,
	MouseSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { createContext, ReactNode, useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useChangeLinkCategory, useChangeLinkIndex } from '@/queries/links';

export const ActiveDraggedContext = createContext(null as number | null);

export default function DndContextProvider({
	children,
}: {
	children: ReactNode;
}) {
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
	const [activeId, setActiveId] = useState<number | null>(null);

	async function handleDragEnd(event: any) {
		const { active, over } = event;
		const { categoryId: currentCategoryId } = active.data.current;
		setActiveId(null);
		console.log(event);

		if (!over?.id || over.id === active.id)
			return toast.info('Link did not move');

		// If dropped into another category with no index specified, put it at the end of it
		if (typeof over.id === 'string' && over.id.startsWith('container')) {
			if (Number(over.id.split('-')[1]) === currentCategoryId) return;
			return changeLinkCategory({
				id: active.id,
				newCategoryId: Number(over.id.split('-')[1]),
			});
		}

		if (over.data.current?.index !== undefined) {
			// new infos
			const { categoryId: newCategoryId, index: newIndex } =
				over.data.current;

			return changeLinkIndex({
				id: active.id,
				newIndex,
				newCategoryId,
			});
		}
	}

	async function handleDragStart(event: any) {
		setActiveId(event.active.id);
	}

	return (
		<DndContext
			id='dnd-context-id'
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			// onDragOver={handleDragOver}
			sensors={sensors}
		>
			<ActiveDraggedContext.Provider value={activeId}>
				{children}
			</ActiveDraggedContext.Provider>
		</DndContext>
	);
}
