'use client';
import React, { ReactNode, useContext } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2Icon } from 'lucide-react';
import { deleteLink } from '../server-actions/links';
import { EditingModeContext } from './EditingModeContextProvider';

interface LinkCardProps {
	children: ReactNode;
	id: number;
}

export default function LinkCard({ children, id }: LinkCardProps) {
	const { editingMode } = useContext(EditingModeContext);
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id,
	});
	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		  }
		: undefined;

	return (
		<li
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className='relative text-center border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-10'
		>
			{editingMode && (
				<Trash2Icon
					stroke='red'
					size={18}
					className='absolute cursor-pointer z-20 right-2'
					onClick={async () => await deleteLink(id)}
				/>
			)}
			{children}
		</li>
	);
}
