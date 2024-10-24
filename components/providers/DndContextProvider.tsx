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
import { CategoryWithLinksType } from '@/lib/types';
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
		parentId: undefined | number;
	}>({
		id: undefined,
		type: undefined,
		parentId: undefined,
	});

	const resetActiveDragged = () =>
		setActiveDragged({
			id: undefined,
			type: undefined,
			parentId: undefined,
		});

	const currentCategories = useRef<CategoryWithLinksType[]>();

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
				parentId: active.data.current.column,
			});
		}
		// If dragging a link
		if (active.data.current.type === 'link') {
			return setActiveDragged({
				id: draggedElementId,
				type: active.data.current.type,
				parentId: active.data.current.categoryId,
			});
		}
	}

	// Used to reorder links/categories when changing categories/columns
	function handleDragOver(event: any) {
		const { over, active } = event;
		if (!over) return;

		// If dragging a category
		if (
			activeDragged.id !== undefined &&
			activeDragged.type === 'category'
		) {
			const newColumn: number =
				over.data.current?.column ?? Number(over.id.split('-')[1]);
			const currentColumn = active.data?.current?.column;

			if (newColumn === currentColumn) return;

			return updateCategoriesPosition({
				id: activeDragged.id,
				newColumn,
			});
		}

		// If dragging a link
		if (activeDragged.id !== undefined && activeDragged.type === 'link') {
			const newCategoryId: number =
				over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
			const currentCategoryId = active.data.current?.categoryId;
			const newIndex =
				over.data.current.type === 'link'
					? over.data.current.sortable.index
					: undefined;

			if (
				newCategoryId === currentCategoryId ||
				over.data.current.type === 'column'
			)
				return;
			// Update the cache only if link was moved to another category
			return updateLinksPosition({
				id: activeDragged.id,
				newCategoryId,
				newIndex,
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
				over?.data.current?.column ?? Number(over.id.split('-')[1]);

			if (
				activeDragged.id === Number(over.id.split('-')[1]) &&
				newColumn === activeDragged.parentId &&
				over.data.current.type === 'category'
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
			newCategoryId === activeDragged.parentId &&
			over.data.current.type === 'link'
		)
			return;

		if (activeDragged.id !== undefined) {
			const newIndex =
				over.data.current.type === 'category'
					? undefined
					: over.data.current?.sortable?.index;

			moveLink({
				id: activeDragged.id,
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
				{activeDragged.id &&
				activeDragged.type === 'link' &&
				currentCategories.current ? (
					<LinkCardOverlay
						link={currentCategories.current
							.find((category) =>
								category.links.some(
									(link) => link.id === activeDragged.id
								)
							)
							?.links.find(
								(link) => link.id === activeDragged.id
							)}
					/>
				) : null}
				{activeDragged.id &&
				activeDragged.type === 'category' &&
				currentCategories.current ? (
					<CategoryCardOverlay
						title={
							currentCategories.current.find(
								(category) => category.id === activeDragged.id
							)?.title
						}
					/>
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
