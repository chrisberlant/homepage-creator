'use client';

import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	MouseSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { createContext, ReactNode, useRef, useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { updateCache, useMoveLink } from '@/queries/links';
import LinkCardOverlay from '../LinkCardOverlay';

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
		// useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const [activeId, setActiveId] = useState<number | null>(null);

	const { mutate: moveLink } = useMoveLink();

	function handleDragEnd(event: any) {
		setActiveId(null);
		const { active, over } = event;
		if (active.id === over.id) return;

		const newCategoryId =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);
		const currentIndex = active.data.current.sortable.index;
		const newIndex = over.data.current?.sortable?.index;

		return moveLink({
			id: active.id,
			currentIndex,
			newIndex,
			newCategoryId,
		});
	}

	// Used to reorder elements when category changes
	function handleDragOver(event: any) {
		const { active, over } = event;
		// console.log('onDrag event', event);
		if (!over) return;
		const newCategoryId: number =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);
		const currentIndex: number = active.data.current.sortable.index;
		const newIndex: number | undefined = over.data.current?.sortable?.index;
		const currentCategoryId = active?.data.current?.categoryId;

		if (newCategoryId !== currentCategoryId)
			return updateCache({
				id: active.id as number,
				currentIndex,
				newIndex,
				newCategoryId,
			});
	}

	function handleDragStart(event: any) {
		setActiveId(event.active.id);
		// movingElement.current = {
		// 	categoryId: event.active.data.current.categoryId,
		// 	index: event.active.data.current.index,
		// };
	}

	return (
		<DndContext
			id='dnd-context-id'
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDragCancel={() => setActiveId(null)}
			sensors={sensors}
		>
			<DragOverlay>
				{activeId ? <LinkCardOverlay id={activeId} /> : null}
			</DragOverlay>
			{children}
		</DndContext>
	);
}
