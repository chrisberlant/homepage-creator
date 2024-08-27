'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import { EditingModeContext } from './providers/EditingModeContextProvider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LinkCardEditButton from './LinkCardEditButton';
import { useDeleteLink } from '../queries/links';

interface LinkCardProps {
	id: number;
	index: number;
	title: string;
	url: string;
	categoryId: number;
}

export default function LinkCard({
	id,
	index,
	title,
	url,
	categoryId,
}: LinkCardProps) {
	const { editingMode } = useContext(EditingModeContext);
	const [disabledDragging, setDisabledDragging] = useState(false);
	const { mutate: deleteLink } = useDeleteLink();

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
		data: {
			categoryId,
			index,
		},
		disabled: disabledDragging,
	});
	const style = {
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.3 : 1,
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={`relative justify-between text-center flex border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20 ${
				editingMode ? 'cursor-move' : 'cursor-pointer'
			}`}
		>
			{editingMode ? (
				<>
					<LinkCardEditButton
						disableDragging={setDisabledDragging}
						defaultTitle={title}
						defaultUrl={url}
						id={id}
					/>
					<span>{title}</span>
					<Trash2Icon
						stroke='red'
						size={18}
						className='cursor-pointer'
						onClick={() => deleteLink(id)}
					/>
				</>
			) : (
				<a
					href={url}
					target='_blank'
					title={url}
					className='flex-1 cursor-pointer'
				>
					{title}
				</a>
			)}
		</div>
	);
}
