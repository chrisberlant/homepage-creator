'use client';

import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	MouseSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { createContext, ReactNode, useState } from 'react';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
	updateCache,
	useChangeLinkCategory,
	useChangeLinkIndex,
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

	// Used to reorder elements when category changes
	async function handleDragOver(event: any) {
		const { active, over } = event;
		if (!over) return;
		const newCategoryId =
			over.data.current?.categoryId ?? Number(over.id.split('-')[1]);
		const currentCategoryId = active.data.current.categoryId;

		if (currentCategoryId === newCategoryId || active.id === over.id)
			return;

		const linkId = active.id;
		const newIndex = over.data.current?.index ?? 0;
		console.log('linkId', linkId);
		console.log('newIndex', newIndex);
		console.log('query');
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
