'use client';

import Dashboard from '@/components/Dashboard';
import { useEffect } from 'react';

export default function Page() {
	const wallpaper = localStorage.getItem('wallpaper');

	useEffect(() => {
		if (wallpaper) {
			document.body.style.backgroundImage = `url(${wallpaper})`;
			document.body.style.backgroundSize = 'cover';
			document.body.style.backgroundPosition = 'center';
		}

		return () => {
			document.body.style.backgroundImage = '';
		};
	}, [wallpaper]);

	return <Dashboard />;
}
