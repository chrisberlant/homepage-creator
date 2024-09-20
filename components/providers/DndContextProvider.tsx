'use client';

import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	MouseSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { act, createContext, ReactNode, useRef, useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import LinkCardOverlay from '../LinkCardOverlay';
import { CategoryType } from '@/lib/types';
import { browserQueryClient } from './QueryClientProvider';
import { updateLinksPosition, useMoveLink } from '@/queries/links.queries';
import {
	updateCategoriesPosition,
	useMoveCategory,
} from '@/queries/categories.queries';
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
		id: undefined | number;
		type: undefined | 'link' | 'category';
		index: undefined | number;
		parentId: undefined | number;
	}>({
		id: undefined,
		type: undefined,
		index: undefined,
		parentId: undefined,
	});

	const resetActiveDragged = () =>
		setActiveDragged({
			id: undefined,
			type: undefined,
			index: undefined,
			parentId: undefined,
		});

	const currentCategories = useRef<CategoryType[]>();

	function handleDragStart(event: any) {
		const { active } = event;
		const draggedElementId = active.id;

		// Save the current state of the data
		currentCategories.current = browserQueryClient?.getQueryData([
			'categories',
		]);

		// Save the original data of the element being dragged
		// If dragging a category
		if (active.data.current.type === 'category') {
			return setActiveDragged({
				id: Number(draggedElementId.split('-')[1]),
				type: active.data.current.type,
				index: active.data.current.sortable.index,
				parentId: active.data.current.columnId,
			});
		}
		// If dragging a link
		if (active.data.current.type === 'link') {
			return setActiveDragged({
				id: draggedElementId,
				type: active.data.current.type,
				index: active.data.current.sortable.index,
				parentId: active.data.current.categoryId,
			});
		}
	}

	// Used to reorder links when changing categories or columns
	function handleDragOver(event: any) {
		const { over, active } = event;
		if (!over) return;

		// If dragging a category
		if (
			activeDragged.id !== undefined &&
			activeDragged.type === 'category'
		) {
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
		if (activeDragged.id !== undefined && activeDragged.type === 'link') {
			const newCategoryId: number =
				over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
			const currentCategoryId = activeDragged.parentId;

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
		if (!over) return resetActiveDragged();

		// If a category is moving
		if (
			activeDragged.id !== undefined &&
			activeDragged.type === 'category' &&
			(over.data.current.type === 'category' ||
				over.data.current.type === 'column')
		) {
			const newColumn =
				over?.data.current?.columnId ?? Number(over.id.split('-')[1]);
			if (
				activeDragged.id === Number(over.id.split('-')[1]) &&
				newColumn === activeDragged.parentId
			)
				return resetActiveDragged();

			const newIndex =
				over.data.current.type === 'column'
					? undefined
					: over.data.current?.sortable?.index;

			moveCategory({
				id: activeDragged.id,
				newIndex,
				newColumn,
			});

			return resetActiveDragged();
		}

		// If a link is moving
		const newCategoryId =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);

		if (
			activeDragged.id === over.id &&
			newCategoryId === activeDragged.parentId
		)
			return;

		if (
			activeDragged.id !== undefined &&
			activeDragged.index !== undefined
		) {
			const newIndex =
				over.data.current.type === 'category'
					? undefined
					: over.data.current?.sortable?.index;

			moveLink({
				id: activeDragged.id,
				currentIndex: activeDragged.index,
				newIndex,
				newCategoryId,
			});

			return resetActiveDragged();
		}
	}

	function handleDragCancel() {
		resetActiveDragged();
		return browserQueryClient?.setQueryData(
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
