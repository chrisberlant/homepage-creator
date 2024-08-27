'use client';

import React from 'react';
import { PenIcon, Trash2Icon } from 'lucide-react';
import { useGetCategories } from '@/queries/categories';

export default function LinkCardOverlay({ id }: { id: number }) {
	const { data: categories } = useGetCategories();
	const draggedLinkTitle = categories
		?.find((category) => category.links.some((link) => link.id === id))
		?.links.find((link) => link.id === id)?.title;

	return (
		<div className='relative cursor-move justify-between text-center flex border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20'>
			<PenIcon size={18} />
			<span>{draggedLinkTitle}</span>
			<Trash2Icon stroke='red' size={18} />
		</div>
	);
}
