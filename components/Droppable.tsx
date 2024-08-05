'use client';

import React, { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function Droppable({ children }: { children: ReactNode }) {
	const { isOver, setNodeRef } = useDroppable({
		id: 'droppable',
	});
	const style = {
		color: isOver ? 'green' : undefined,
	};

	return (
		<div ref={setNodeRef} style={style} className='border-2 p-8 m-4 w-1/3 '>
			{children}
		</div>
	);
}
