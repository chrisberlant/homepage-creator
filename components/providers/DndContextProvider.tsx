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
import LinkCardOverlay from '../LinkCardOverlay';
import { CategoryType } from '@/lib/types';
import { browserQueryClient } from './QueryClientProvider';
import { updateCache, useMoveLink } from '@/queries/links.queries';
import { useMoveCategory } from '@/queries/categories.queries';
import CategoryCardOverlay from '../CategoryCardOverlay';

// Used to reduce categories cards when dragging one of them
export const DraggingCategoryContext = createContext(false);

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
	const { mutate: moveCategory } = useMoveCategory();

	const [activeLinkId, setActiveLinkId] = useState<number | null>(null);
	const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
		null
	);
	const [draggingCategory, setDraggingCategory] = useState(false);

	const currentCategories = useRef<CategoryType[]>();
	const currentLinkInfos = useRef<{ index: number; categoryId: number }>();

	function handleDragStart(event: any) {
		const draggedElementId = event.active.id;
		currentCategories.current = browserQueryClient?.getQueryData([
			'categories',
		]);

		if (
			typeof draggedElementId === 'string' &&
			draggedElementId.startsWith('container')
		) {
			setActiveCategoryId(Number(draggedElementId.split('-')[1]));
			return setDraggingCategory(true);
		}

		setActiveLinkId(draggedElementId);
		currentLinkInfos.current = {
			index: event.active.data.current.sortable.index,
			categoryId: event.active.data.current.categoryId,
		};
	}

	// Used to reorder links when changing categories
	function handleDragOver(event: any) {
		const { over, active } = event;
		if (!over) return;

		const draggedElementId = active.id;
		const newCategoryId: number =
			over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
		const currentCategoryId = active.data?.current?.categoryId;
		if (newCategoryId === currentCategoryId) return;

		// Update the cache only if link was moved to another category
		updateCache({
			id: draggedElementId,
			newCategoryId,
		});
	}

	function handleDragEnd(event: any) {
		const { active, over } = event;
		if (!over) return;

		setActiveLinkId(null);
		setActiveCategoryId(null);
		if (draggingCategory) setDraggingCategory(false);

		const draggedElementId = active.id;
		const currentIndex = active.data.current.sortable.index;

		// If a category container is moving
		if (
			typeof draggedElementId === 'string' &&
			draggedElementId.startsWith('container') &&
			typeof over.id === 'string' &&
			over.id.startsWith('container')
		) {
			if (draggedElementId === over.id) return;

			const newIndex = over.data.current.sortable.index;
			return moveCategory({
				id: Number(draggedElementId.split('-')[1]),
				currentIndex,
				newIndex,
			});
		}

		// If a link is moving
		const newCategoryId =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);
		if (
			draggedElementId === over.id &&
			newCategoryId === currentLinkInfos.current?.categoryId
		)
			return;

		const newIndex =
			over.data.current?.sortable?.index === -1
				? undefined
				: over.data.current?.sortable?.index;

		moveLink({
			id: draggedElementId,
			currentIndex,
			newIndex,
			newCategoryId,
		});
	}

	function handleDragCancel() {
		setActiveLinkId(null);
		setActiveCategoryId(null);
		if (draggingCategory) setDraggingCategory(false);

		browserQueryClient?.setQueryData(
			['categories'],
			currentCategories.current
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
				{activeLinkId ? <LinkCardOverlay id={activeLinkId} /> : null}
				{activeCategoryId ? (
					<CategoryCardOverlay id={activeCategoryId} />
				) : null}
			</DragOverlay>
			<DraggingCategoryContext.Provider value={draggingCategory}>
				{children}
			</DraggingCategoryContext.Provider>
		</DndContext>
	);
}
