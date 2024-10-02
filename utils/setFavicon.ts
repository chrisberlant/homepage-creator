export default function setFavicon(data: { id: number; url: string }) {
	const existingFavicons: { id: number; url: string }[] = JSON.parse(
		localStorage.getItem('favicons') || '[]'
	);
	const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain_url=${data.url}`;
	const fallbackFavicon = '/favicon-not-found';

	const img = new Image();
	img.src = faviconUrl;

	// If favicon loads successfully
	img.onload = () => {
		existingFavicons.push({
			id: data.id,
			url: faviconUrl,
		});
		localStorage.setItem('favicons', JSON.stringify(existingFavicons));
		console.log('onload');
	};

	// If favicon fails to load
	img.onerror = () => {
		existingFavicons.push({
			id: data.id,
			url: fallbackFavicon,
		});
		localStorage.setItem('favicons', JSON.stringify(existingFavicons));
		console.log('error');
	};
}
