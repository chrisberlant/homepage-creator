'use client';

import React, { ReactNode, useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Trash2Icon } from 'lucide-react';
import { deleteCategory } from '../server-actions/categories';
import CreateLinkButton from './CreateLinkButton';
import { EditingModeContext } from './EditingModeContextProvider';

interface CategoryCardProps {
	children: ReactNode;
	id: number;
	title: string;
}

export default function CategoryCard({
	children,
	id,
	title,
}: CategoryCardProps) {
	const { editingMode } = useContext(EditingModeContext);
	const { isOver, setNodeRef } = useDroppable({
		id,
	});
	const style = {
		color: isOver ? 'green' : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='border-2 shadow-md dark:shadow-none bg-card p-2 px-5 m-4 w-1/3 rounded-2xl relative'
		>
			<h2 className='mb-4 font-bold'>{title}</h2>
			{editingMode && (
				<>
					<CreateLinkButton categoryId={id} />
					<Trash2Icon
						stroke='red'
						className='absolute right-4 top-3 cursor-pointer'
						onClick={async () => await deleteCategory(id)}
					/>
				</>
			)}
			<div className='flex flex-col gap-1.5'>{children}</div>
		</div>
	);
}
