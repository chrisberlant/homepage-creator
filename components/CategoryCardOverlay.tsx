'use client';

import React from 'react';
import { useGetCategories } from '@/queries/categories.queries';

export default function CategoryCardOverlay({ id }: { id: number }) {
	const { data: categories } = useGetCategories();
	const title = categories?.find((category) => category.id === id)?.title;

	return (
		<div className='relative rounded-2xl border-2 bg-card px-5 py-3 shadow-md dark:shadow-none'>
			<h2 className='flex-1 text-center font-bold'>{title}</h2>
		</div>
	);
}
