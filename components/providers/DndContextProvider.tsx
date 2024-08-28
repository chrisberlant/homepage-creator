'use client';

import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	MouseSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { createContext, ReactNode, useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
	updateCache,
	useChangeLinkCategory,
	useMoveLink,
} from '@/queries/links';
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
	const { mutate: changeLinkCategory } = useChangeLinkCategory();
	const { mutate: moveLink } = useMoveLink();
	const [activeId, setActiveId] = useState<number | null>(null);

	async function handleDragEnd(event: any) {
		const { active, over } = event;
		const { categoryId: currentCategoryId, currentIndex } =
			active.data.current;
		setActiveId(null);
		console.log(event);

		if (
			!over?.id ||
			(over.data.current?.index === currentIndex &&
				over.data.current?.categoryId === currentCategoryId)
		)
			return toast.info('Link did not move');

		// If dropped into another category with no index specified, put it at the end of it
		if (typeof over.id === 'string' && over.id.startsWith('container')) {
			console.log('change category with no index', over.id);
			return moveLink({
				id: active.id,
				newCategoryId: Number(over.id.split('-')[1]),
			});
		}
		if (over.data.current?.index !== undefined) {
			// new infos
			const { categoryId: newCategoryId, index: newIndex } =
				over.data.current;
			console.log('move link with index', newIndex);
			return moveLink({
				id: active.id,
				newIndex,
				newCategoryId,
			});
		}
		console.log('test');
	}

	// Used to reorder elements when category changes
	async function handleDragOver(event: any) {
		const { active, over } = event;
		if (!over) return;
		const newCategoryId =
			over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
		const currentCategoryId = active.data.current.categoryId;

		// Only use the function when dragging to another category
		if (currentCategoryId === newCategoryId || active.id === over.id)
			return;

		const linkId = active.id;
		const newIndex = over.data.current?.index;
		console.log('linkId', linkId);
		console.log('newIndex', newIndex);

		updateCache({
			linkId,
			newIndex,
			newCategoryId,
		});
	}

	return (
		<DndContext
			id='dnd-context-id'
			onDragStart={(event) => setActiveId(Number(event.active.id))}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDragCancel={() => setActiveId(null)}
			sensors={sensors}
		>
			{activeId && (
				<DragOverlay>
					<LinkCardOverlay id={activeId} />
				</DragOverlay>
			)}
			{children}
		</DndContext>
	);
}
