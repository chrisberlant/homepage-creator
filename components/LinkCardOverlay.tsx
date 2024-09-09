'use client';

import React, { useState } from 'react';
import { useGetCategories } from '@/queries/categories.queries';
import Image from 'next/image';

export default function LinkCardOverlay({ id }: { id: number }) {
	const { data: categories } = useGetCategories();
	const link = categories
		?.find((category) => category.links.some((link) => link.id === id))
		?.links.find((link) => link.id === id);
	const title = link?.title;
	const url = link?.url;
	const [imgSrc, setImgSrc] = useState(
		`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`
	);

	return (
		<div className='cursor-move justify-center text-center flex border rounded-xl p-2 bg-muted shadow-sm dark:shadow-none z-20'>
			<div className='flex items-center justify-center mr-2'>
				<Image
					height={15}
					width={15}
					src={imgSrc}
					alt='favicon'
					onError={() => setImgSrc('/favicon-not-found.svg')}
				/>
			</div>
			{title}
		</div>
	);
}
