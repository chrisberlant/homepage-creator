'use client';
import React, { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function Draggable({ children }: { children: ReactNode }) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: 'draggable',
	});
	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		  }
		: undefined;

	return (
		<button
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className='border rounded-xl p-2 bg-card shadow-sm dark:shadow-none'
		>
			{children}
		</button>
	);
}
