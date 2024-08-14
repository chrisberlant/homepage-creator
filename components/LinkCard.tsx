'use client';
import React, { ReactNode, useContext } from 'react';
import { Trash2Icon } from 'lucide-react';
import { deleteLink } from '../server-actions/links';
import { EditingModeContext } from './contexts/EditingModeContextProvider';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LinkCardProps {
	id: number;
	index: number;
	title: string;
	categoryId: number;
}

export default function LinkCard({
	id,
	index,
	title,
	categoryId,
}: LinkCardProps) {
	const { editingMode } = useContext(EditingModeContext);
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({
			id,
			data: {
				categoryId,
				index,
			},
		});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
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
			<span>{title}</span>
		</div>
	);
}
