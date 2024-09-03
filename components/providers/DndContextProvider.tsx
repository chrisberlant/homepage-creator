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
import { CategoryType, LinkType } from '@/lib/types';
import { browserQueryClient } from './QueryClientProvider';

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
	const { mutate: moveLink } = useMoveLink();

	const [activeId, setActiveId] = useState<number | null>(null);
	const previousCategories = useRef<CategoryType[]>();
	const previousLinkInfos = useRef<{ index: number; categoryId: number }>();

	function handleDragStart(event: any) {
		setActiveId(event.active.id);
		previousLinkInfos.current = {
			index: event.active.data.current.sortable.index,
			categoryId: event.active.data.current.categoryId,
		};
		previousCategories.current = browserQueryClient?.getQueryData([
			'categories',
		]);
	}

	// Used to reorder elements when category changes
	function handleDragOver(event: any) {
		const { over, active } = event;
		if (!over) return;

		const newCategoryId: number =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);
		const currentCategoryId = active?.data?.current?.categoryId;
		if (newCategoryId === currentCategoryId) return;

		updateCache({
			id: active.id,
			newCategoryId,
		});
	}

	function handleDragEnd(event: any) {
		setActiveId(null);
		const { active, over } = event;
		if (!over) return;

		const newCategoryId =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);
		if (
			active.id === over.id &&
			newCategoryId === previousLinkInfos.current?.categoryId
		)
			return;

		const currentIndex = active.data.current.sortable.index;
		const newIndex = over.data.current?.sortable?.index;

		moveLink({
			id: active.id,
			currentIndex,
			newIndex,
			newCategoryId,
		});
	}

	function handleDragCancel() {
		setActiveId(null);
		browserQueryClient?.setQueryData(
			['categories'],
			previousCategories.current
		);
	}

	return (
		<DndContext
			id='dnd-context-id'
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDragCancel={handleDragCancel}
			sensors={sensors}
		>
			<DragOverlay>
				{activeId ? <LinkCardOverlay id={activeId} /> : null}
			</DragOverlay>
			{children}
		</DndContext>
	);
}
