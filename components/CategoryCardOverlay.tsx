'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useGetCategories } from '@/queries/categories.queries';

export default function CategoryCardOverlay({ id }: { id: number }) {
	const { data: categories } = useGetCategories();
	const draggedCategoryTitle = categories?.find(
		(category) => category.id === id
	)?.title;

	return (
		<div className='relative cursor-move justify-between text-center flex border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20 h-40'>
			<ArrowUp size={18} />
			<span>{draggedCategoryTitle}</span>
		</div>
	);
}
