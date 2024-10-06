import React from 'react';

export default function CategoryCardOverlay({
	title,
}: {
	title: string | undefined;
}) {
	return (
		<div className='relative rounded-2xl border-2 bg-card px-5 py-3 shadow-md dark:shadow-none'>
			<h2 className='flex-1 text-center font-bold'>{title}</h2>
		</div>
	);
}
