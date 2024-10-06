import Image from 'next/image';
import FaviconNotFound from './FaviconNotFound';
import { useState } from 'react';

export default function Favicon({ url }: { url: string }) {
	const [imageError, setimageError] = useState(false);

	return imageError ? (
		<FaviconNotFound className='mr-2' />
	) : (
		<Image
			className='mr-2'
			height={15}
			width={15}
			src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}&sz=15`}
			alt='favicon'
			onError={() => setimageError(true)}
		/>
	);
}
{
}
