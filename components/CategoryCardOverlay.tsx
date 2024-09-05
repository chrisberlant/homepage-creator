'use client';

import React from 'react';
import { useGetCategories } from '@/queries/categories.queries';

export default function CategoryCardOverlay({ id }: { id: number }) {
	const { data: categories } = useGetCategories();
	const title = categories?.find((category) => category.id === id)?.title;

	return (
		<div className='cursor-move justify-between text-center flex border-2 px-5 rounded-xl p-2 bg-card shadow-sm dark:shadow-none z-20'>
			<h2 className='font-bold text-center flex-1'>{title}</h2>
		</div>
	);
}
