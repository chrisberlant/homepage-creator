'use client';
import React, { ReactNode, useContext } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2Icon } from 'lucide-react';
import { deleteLink } from '../server-actions/links';
import { EditingModeContext } from './EditingModeContextProvider';
import { toast } from 'sonner';

interface LinkCardProps {
	children: ReactNode;
	id: number;
	index: number;
	categoryId: number;
}

export default function LinkCard({
	children,
	id,
	index,
	categoryId,
}: LinkCardProps) {
	const { editingMode } = useContext(EditingModeContext);
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id,
		data: {
			categoryId,
			index,
		},
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
			className='relative text-center border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20'
		>
			{editingMode && (
				<Trash2Icon
					stroke='red'
					size={18}
					className='absolute cursor-pointer z-30 right-2'
					onClick={async () => {
						const result = await deleteLink(id);
						if (result?.error) toast.error(result.error);
					}}
				/>
			)}
			{children}
		</li>
	);
}
