'use client';

import React from 'react';
import { PenIcon, Trash2Icon } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LinkCardOverlayProps {
	id: number;
	title: string;
}

export default function LinkCardOverlay({ id, title }: LinkCardOverlayProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id,
		});
	const style = {
		transform: CSS.Transform.toString(transform),
		opacity: 0.8,
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className='relative cursor-move justify-between text-center flex border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20'
		>
			<PenIcon size={18} />
			<span>{title}</span>
			<Trash2Icon stroke='red' size={18} />
		</div>
	);
}
