import React, { useState } from 'react';
import Image from 'next/image';
import FaviconNotFound from './FaviconNotFound';
import { LinkType } from '@/lib/types';

export default function LinkCardOverlay({
	link,
}: {
	link: LinkType | undefined;
}) {
	const title = link?.title;
	const url = link?.url;
	const [faviconFound, setFaviconFound] = useState(true);

	return (
		<div className='flex cursor-move justify-center rounded-xl border bg-secondary p-2 text-center shadow-sm dark:shadow-none'>
			<div className='mr-2 flex items-center justify-center'>
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
