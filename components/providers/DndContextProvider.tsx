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
import {
	rectSwappingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import LinkCardOverlay from '../LinkCardOverlay';
import { CategoryType } from '@/lib/types';
import { browserQueryClient } from './QueryClientProvider';
import { updateCache, useMoveLink } from '@/queries/links.queries';
import { useMoveCategory } from '@/queries/categories.queries';
import CategoryCardOverlay from '../CategoryCardOverlay';

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
	const { mutate: moveCategory } = useMoveCategory();

	const [activeLinkId, setActiveLinkId] = useState<number | null>(null);
	const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
		null
	);
	const currentCategories = useRef<CategoryType[]>();
	const currentLinkInfos = useRef<{ index: number; categoryId: number }>();
	const currentCategoryIndex = useRef<number>();

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
			return console.log('category moving');
		}

		setActiveLinkId(draggedElementId);
		console.log('link moving');
		currentLinkInfos.current = {
			index: event.active.data.current.sortable.index,
			categoryId: event.active.data.current.categoryId,
		};
	}

	// Used to reorder elements when category changes
	function handleDragOver(event: any) {
		// console.log(event);
		// const { over, active } = event;
		// if (!over) return;
		// const draggedElementId = active.id;
		// if (
		// 	typeof draggedElementId === 'string' &&
		// 	draggedElementId.startsWith('container') &&
		// 	typeof over.id === 'string' &&
		// 	over.id.startsWith('container')
		// ) {
		// 	const newIndex = Number(over.id.split('-')[1]);
		// 	console.log(newIndex);
		// 	return;
		// }
		// const newCategoryId: number =
		// 	over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
		// const currentCategoryId = active.data?.current?.categoryId;
		// if (newCategoryId === currentCategoryId) return;
		// updateCache({
		// 	id: draggedElementId,
		// 	newCategoryId,
		// });
	}

	function handleDragEnd(event: any) {
		setActiveLinkId(null);
		setActiveCategoryId(null);
		const { active, over } = event;
		if (!over) return;
		console.log(event);
		const draggedElementId = active.id;

		if (
			typeof draggedElementId === 'string' &&
			draggedElementId.startsWith('container') &&
			typeof over.id === 'string' &&
			over.id.startsWith('container')
		) {
			const newIndex = over.data.current.sortable.index;
			console.log(newIndex);
			return;
		}

		const newCategoryId =
			over?.data.current?.categoryId ?? Number(over?.id.split('-')[1]);
		if (
			draggedElementId === over.id &&
			newCategoryId === currentLinkInfos.current?.categoryId
		)
			return;

		const currentIndex = active.data.current.sortable.index;
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
			{children}
		</DndContext>
	);
}
