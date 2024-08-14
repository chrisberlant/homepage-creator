'use client';

import React, { useState } from 'react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './SortableItem';

export default function Test() {
	const [items, setItems] = useState([1, 2, 3]);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={items}
				strategy={verticalListSortingStrategy}
			>
				<div className='flex flex-col justify-start gap-2 w-24'>
					{items.map((id) => (
						<SortableItem key={id} id={id} />
					))}
				</div>
			</SortableContext>
		</DndContext>
	);

	function handleDragEnd(event: any) {
		const { active, over } = event;

		if (active.id !== over.id) {
			setItems((items) => {
				const oldIndex = items.indexOf(active.id);
				const newIndex = items.indexOf(over.id);

				return arrayMove(items, oldIndex, newIndex);
			});
		}
	}
}
