import React from 'react';
import { LinkType } from '@/lib/types';
import Favicon from './Favicon';

export default function LinkCardOverlay({ link }: { link: LinkType }) {
	const title = link?.title;
	const url = link?.url;

	return (
		<div className='flex cursor-move justify-center rounded-xl border bg-secondary p-2 text-center shadow-sm dark:shadow-none'>
			<div className='flex items-center justify-center'>
				<Favicon url={url} />
			</div>
			{title}
		</div>
	);
}
