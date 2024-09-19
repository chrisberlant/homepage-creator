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
		const { active } = event;
		const draggedElementId = active.id;

		currentCategories.current = browserQueryClient?.getQueryData([
			'categories',
		]);

		// If dragging a category
		if (active.data.current.type === 'category') {
			setActiveDragged({
				id: Number(draggedElementId.split('-')[1]),
				type: active.data.current.type,
			});
			return (draggedCategoryInfos.current = {
				index: active.data.current.sortable.index,
				columnId: active.data.current.columnId,
			});
		}
		// If dragging a link
		if (active.data.current.type === 'link') {
			setActiveDragged({
				id: draggedElementId,
				type: active.data.current.type,
			});
			return (draggedLinkInfos.current = {
				index: active.data.current.sortable.index,
				categoryId: active.data.current.categoryId,
			});
		}
	}

	// Used to reorder links when changing categories or columns
	function handleDragOver(event: any) {
		const { over, active } = event;
		if (!over) return;

		// If dragging a category
		if (activeDragged.id && activeDragged.type === 'category') {
			const newColumnId: number =
				over.data.current?.columnId ?? Number(over.id.split('-')[1]);
			const currentColumnId = active.data?.current?.columnId;
			if (newColumnId === currentColumnId) return;

			return updateCategoriesPosition({
				id: activeDragged.id,
				newColumnId,
			});
		}

		// If dragging a link
		if (activeDragged.id && activeDragged.type === 'link') {
			const newCategoryId: number =
				over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
			const currentCategoryId: number = active.data?.current?.categoryId;

			if (
				newCategoryId === currentCategoryId ||
				over.data.current.type === 'column'
			)
				return;

			// Update the cache only if link was moved to another category
			return updateLinksPosition({
				id: activeDragged.id,
				newCategoryId,
			});
		}
	}

	function handleDragEnd(event: any) {
		const { over } = event;
		if (!over) return;

		// If a category is moving
		if (
			activeDragged.id &&
			activeDragged.type === 'category' &&
			typeof over.id === 'string' &&
			over.id.startsWith('category') &&
			draggedCategoryInfos.current
		) {
			const newColumnId = over?.data.current?.columnId;

			if (
				activeDragged.id === Number(over.id.split('-')[1]) &&
				newColumnId === draggedCategoryInfos.current?.columnId
			)
				return setActiveDragged({ id: null, type: null });

			const currentIndex = draggedCategoryInfos.current.index;
			const newIndex =
				over.data.current.type === 'column'
					? undefined
					: over.data.current?.sortable?.index;
			console.log(over.data.current.type);
			console.log(newIndex);

			moveCategory({
				id: activeDragged.id,
				currentIndex,
				currentColumn: draggedCategoryInfos.current!.columnId,
				newColumn: newColumnId,
				newIndex,
			});

			return setActiveDragged({ id: null, type: null });
		}

		// If a link is moving
		const newCategoryId =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);

		if (
			activeDragged.id === over.id &&
			newCategoryId === draggedLinkInfos.current?.categoryId
		)
			return console.log('same');

		if (activeDragged.id && draggedLinkInfos.current) {
			const currentIndex = draggedLinkInfos.current.index;
			console.log(over);
			// console.log(over.data.current?.sortable?.index);
			const newIndex =
				over.data.current.type === 'category'
					? undefined
					: over.data.current?.sortable?.index;

			moveLink({
				id: activeDragged.id,
				currentIndex,
				newIndex,
				newCategoryId,
			});

			return setActiveDragged({ id: null, type: null });
		}
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
