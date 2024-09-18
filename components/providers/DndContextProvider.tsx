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
import {
	updateCategoriesPosition,
	updateLinksPosition,
	useMoveLink,
} from '@/queries/links.queries';
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

	const [activeDragged, setActiveDragged] = useState<{
		id: null | number;
		type: null | 'link' | 'category';
	}>({
		id: null,
		type: null,
	});

	const currentCategories = useRef<CategoryType[]>();
	const draggedLinkInfos = useRef<{ index: number; categoryId: number }>();
	const draggedCategoryInfos = useRef<{ index: number; columnId: number }>();

	function handleDragStart(event: any) {
		const draggedElementId = event.active.id;
		currentCategories.current = browserQueryClient?.getQueryData([
			'categories',
		]);

		// If dragging a category
		if (
			typeof draggedElementId === 'string' &&
			draggedElementId.startsWith('category')
		) {
			setActiveDragged({
				id: Number(draggedElementId.split('-')[1]),
				type: 'category',
			});
			return (draggedCategoryInfos.current = {
				index: event.active.data.current.sortable.index,
				columnId: event.active.data.current.columnId,
			});
		}
		// If dragging a link
		setActiveDragged({
			id: draggedElementId,
			type: 'link',
		});
		draggedLinkInfos.current = {
			index: event.active.data.current.sortable.index,
			categoryId: event.active.data.current.categoryId,
		};
	}

	// Used to reorder links when changing categories or columns
	function handleDragOver(event: any) {
		const { over, active } = event;
		if (!over) return;

		const draggedElementId = active.id;

		// If dragging a category
		if (
			typeof draggedElementId === 'string' &&
			draggedElementId.startsWith('category')
		) {
			const formattedDraggedElementId = Number(
				draggedElementId.split('-')[1]
			);
			const newColumnId: number =
				over.data.current?.columnId ?? Number(over.id.split('-')[1]);
			const currentColumnId = active.data?.current?.columnId;
			if (newColumnId === currentColumnId) return;

			return updateCategoriesPosition({
				id: formattedDraggedElementId,
				newColumnId,
			});
		}

		// If dragging a link
		const newCategoryId: number =
			over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
		const currentCategoryId = active.data?.current?.categoryId;
		if (newCategoryId === currentCategoryId) return;

		// Update the cache only if link was moved to another category
		updateLinksPosition({
			id: draggedElementId,
			newCategoryId,
		});
	}

	function handleDragEnd(event: any) {
		const { active, over } = event;
		if (!over) return;

		setActiveDragged({ id: null, type: null });

		const draggedElementId = active.id;
		const currentIndex = active.data.current.sortable.index;

		// If a category is moving
		if (
			typeof draggedElementId === 'string' &&
			draggedElementId.startsWith('category') &&
			typeof over.id === 'string' &&
			over.id.startsWith('category')
		) {
			const newColumnId = over?.data.current?.columnId;

			if (
				draggedElementId === over.id &&
				newColumnId === draggedCategoryInfos.current?.columnId
			)
				return;

			const newIndex =
				over.data.current?.sortable?.index === -1
					? undefined
					: over.data.current?.sortable?.index;
			return moveCategory({
				id: Number(draggedElementId.split('-')[1]),
				currentIndex,
				currentColumn: draggedCategoryInfos.current!.columnId,
				newColumn: newColumnId,
				newIndex,
			});
		}

		// If a link is moving
		const newCategoryId =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);
		if (
			draggedElementId === over.id &&
			newCategoryId === draggedLinkInfos.current?.categoryId
		)
			return;

		const newIndex =
			over.data.current?.sortable?.index === -1
				? undefined
				: over.data.current?.sortable?.index;

		return moveLink({
			id: draggedElementId,
			currentIndex,
			newIndex,
			newCategoryId,
		});
	}

	function handleDragCancel() {
		setActiveDragged({ id: null, type: null });
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
				{activeDragged.id && activeDragged.type === 'link' ? (
					<LinkCardOverlay id={activeDragged.id} />
				) : null}
				{activeDragged.id && activeDragged.type === 'category' ? (
					<CategoryCardOverlay id={activeDragged.id} />
				) : null}
			</DragOverlay>
			<DraggingCategoryContext.Provider
				value={activeDragged.type === 'category'}
			>
				{children}
			</DraggingCategoryContext.Provider>
		</DndContext>
	);
}
