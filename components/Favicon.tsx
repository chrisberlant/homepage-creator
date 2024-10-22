import Image from 'next/image';
import FaviconNotFound from './FaviconNotFound';
import { useEffect, useState } from 'react';

export default function Favicon({ url }: { url: string }) {
	const [imageError, setimageError] = useState(false);
	const [firstRender, setFirstRender] = useState(true);

	useEffect(() => {
		setFirstRender(false);
	}, []);

	return (
		<>
			{(firstRender || imageError) && (
				<FaviconNotFound className='mr-2' />
			)}

			{!imageError && !firstRender && (
				<Image
					className='mr-2'
					height={15}
					width={15}
					src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}&sz=15`}
					alt='favicon'
					onError={() => setimageError(true)}
				/>
			)}
		</>
	);
}
