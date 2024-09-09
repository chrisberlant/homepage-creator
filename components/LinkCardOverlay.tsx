'use client';

import React, { useState } from 'react';
import { useGetCategories } from '@/queries/categories.queries';
import Image from 'next/image';
import FaviconNotFound from './FaviconNotFound';

export default function LinkCardOverlay({ id }: { id: number }) {
	const { data: categories } = useGetCategories();
	const link = categories
		?.find((category) => category.links.some((link) => link.id === id))
		?.links.find((link) => link.id === id);
	const title = link?.title;
	const url = link?.url;
	const [faviconFound, setFaviconFound] = useState(true);

	return (
		<div className='cursor-move justify-center text-center flex border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20'>
			<div className='flex items-center justify-center mr-2'>
				{faviconFound ? (
					<Image
						height={15}
						width={15}
						src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`}
						alt='favicon'
						onError={() => setFaviconFound(false)}
					/>
				) : (
					<FaviconNotFound />
				)}
			</div>
			{title}
		</div>
	);
}
