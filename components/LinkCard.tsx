'use client';
import React, { ReactNode, useContext, useState } from 'react';
import { PenIcon, PenOffIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import { deleteLink } from '../server-actions/links';
import { EditingModeContext } from './providers/EditingModeContextProvider';
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
	const [editingTitle, setEditingTitle] = useState({
		enabled: false,
		value: title,
	});

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className='relative text-center border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20 cursor-move'
		>
			{editingMode && (
				<>
					{editingTitle.enabled ? (
						<PenOffIcon
							className='absolute cursor-pointer'
							size={18}
							onClick={() =>
								setEditingTitle({
									...editingTitle,
									enabled: !editingTitle.enabled,
								})
							}
						/>
					) : (
						<PenIcon
							className='absolute cursor-pointer'
							size={18}
							onClick={() =>
								setEditingTitle({
									...editingTitle,
									enabled: !editingTitle.enabled,
								})
							}
						/>
					)}
					<Trash2Icon
						stroke='red'
						size={18}
						className='absolute cursor-pointer right-2'
						onClick={async () => {
							console.log('click');
							// const result = await deleteLink(id);
							// if (result?.error) toast.error(result.error);
						}}
					/>
				</>
			)}
			{editingTitle.enabled ? (
				<form className='flex justify-center gap-2'>
					<input
						value={editingTitle.value}
						onChange={(e) =>
							setEditingTitle({
								...editingTitle,
								value: e.target.value,
							})
						}
						className='text-primary text-center'
					/>
					<SaveIcon type='submit' className='cursor-pointer' />
				</form>
			) : (
				<div>{title}</div>
			)}
		</div>
	);
}
